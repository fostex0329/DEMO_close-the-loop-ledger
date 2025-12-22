#!/usr/bin/env python3
"""
export_json.py
Export Gold layer tables from DuckDB to JSON for Vercel/Next.js consumption.
"""
import argparse
import duckdb
import json
from pathlib import Path
from datetime import datetime, date
from decimal import Decimal


def json_serializer(obj):
    """Custom JSON serializer for types not handled by default."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def export_table_to_json(con, table_name: str, output_path: Path):
    """Export a DuckDB table to JSON file."""
    try:
        # Query all rows with limit
        # Sort by date/created_at to keep latest data
        # Note: Different tables have different date columns, we try to detect or just use LIMIT
        limit_count = 2000
        
        # Determine sort column based on table name (heuristic)
        sort_clause = ""
        if "gold_ledger" in table_name:
            sort_clause = "ORDER BY order_date DESC"
        elif "gold_invoices" in table_name:
            sort_clause = "ORDER BY invoice_date DESC"
        elif "gold_payments" in table_name:
            sort_clause = "ORDER BY payment_date DESC"
        elif "gold_exceptions" in table_name:
            sort_clause = "ORDER BY detected_date DESC"
        elif "gold_documents" in table_name:
            sort_clause = "ORDER BY created_at DESC"
            
        params = f"{sort_clause} LIMIT {limit_count}"
        result = con.execute(f"SELECT * FROM {table_name} {params}").fetchdf()
        
        # Convert to list of dicts
        records = result.to_dict(orient='records')
        
        # Write to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2, default=json_serializer)
        
        print(f"  ✓ {table_name} → {output_path.name} ({len(records)} records)")
        return len(records)
        
    except Exception as e:
        print(f"  ✗ Error exporting {table_name}: {e}")
        return 0


def main():
    parser = argparse.ArgumentParser(description="Export Gold tables to JSON")
    parser.add_argument("--db", default="warehouse.duckdb", help="Path to DuckDB file")
    parser.add_argument("--out", default="web/src/lib", help="Output directory for JSON files")
    parser.add_argument(
        "--tables",
        default="gold_ledger,gold_exceptions,gold_invoices,gold_payments",
        help="Comma-separated list of tables to export"
    )
    args = parser.parse_args()

    db_path = Path(args.db)
    out_dir = Path(args.out)
    tables = [t.strip() for t in args.tables.split(",")]

    if not db_path.exists():
        print(f"Error: DuckDB file not found: {db_path}")
        return 1

    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Connecting to DuckDB: {db_path}", flush=True)
    con = duckdb.connect(str(db_path), read_only=True)

    # Table name to JSON filename mapping
    # Note: dbt creates tables in main_gold schema
    table_mapping = {
        "main_gold.gold_ledger": "orders.json",
        "main_gold.gold_exceptions": "exceptions.json",
        "main_gold.gold_invoices": "invoices.json",
        "main_gold.gold_payments": "payments.json",
    }

    print(f"\nExporting {len(table_mapping)} table(s) to {out_dir}/", flush=True)
    
    total_records = 0
    for table_name, json_filename in table_mapping.items():
        output_path = out_dir / json_filename
        count = export_table_to_json(con, table_name, output_path)
        total_records += count

    con.close()
    
    print(f"\nExport complete: {total_records} total records")
    return 0


if __name__ == "__main__":
    exit(main())
