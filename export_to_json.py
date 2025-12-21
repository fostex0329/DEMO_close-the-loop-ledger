import duckdb
import json
import os

# Connect to the database (in project root)
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'warehouse.duckdb')
output_dir = os.path.join(script_dir, 'web', 'src', 'lib')
os.makedirs(output_dir, exist_ok=True)

print(f"Connecting to: {db_path}")
con = duckdb.connect(db_path, read_only=True)

def export_table(table_name, output_name):
    """Export a dbt table to JSON file"""
    try:
        df = con.sql(f"SELECT * FROM main_gold.{table_name}").df()
        rows = df.to_dict(orient='records')
        output_path = os.path.join(output_dir, f'{output_name}.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(rows, f, default=str, ensure_ascii=False, indent=2)
        print(f"✓ Exported {len(rows)} rows from {table_name} to {output_name}.json")
    except Exception as e:
        print(f"✗ Error exporting {table_name}: {e}")

# Export all gold layer tables
print("\n--- Exporting Gold Layer Tables ---\n")

export_table('gold_ledger', 'orders')
export_table('gold_invoices', 'invoices')
export_table('gold_payments', 'payments')
export_table('gold_exceptions', 'exceptions')

con.close()
print("\n--- Export Complete ---")
