#!/usr/bin/env python3
"""
update_warehouse.py
Load raw data into DuckDB bronze schema with deduplication.
"""
import argparse
import duckdb
from pathlib import Path
from datetime import datetime


def main():
    parser = argparse.ArgumentParser(description="Update DuckDB warehouse with raw data")
    parser.add_argument("--db", default="warehouse.duckdb", help="Path to DuckDB file")
    parser.add_argument("--data-dir", default="data/raw", help="Directory containing raw data files")
    args = parser.parse_args()

    db_path = Path(args.db)
    data_dir = Path(args.data_dir)

    print(f"Connecting to DuckDB: {db_path}")
    con = duckdb.connect(str(db_path))

    # Create bronze schema if not exists
    con.execute("CREATE SCHEMA IF NOT EXISTS bronze;")

    # Find parquet files
    parquet_files = list(data_dir.glob("*.parquet"))
    csv_files = list(data_dir.glob("*.csv"))
    
    data_files = parquet_files + csv_files
    
    if not data_files:
        print(f"No data files found in {data_dir}")
        con.close()
        return

    print(f"Found {len(data_files)} data file(s)")

    for data_file in data_files:
        print(f"Processing: {data_file.name}")
        
        # Determine read function based on extension
        if data_file.suffix == ".parquet":
            read_func = f"read_parquet('{data_file}')"
        else:
            read_func = f"read_csv_auto('{data_file}', ignore_errors=true)"

        # Create staging table
        staging_table = f"bronze.staging_{data_file.stem}"
        
        try:
            # Load into staging
            con.execute(f"""
                CREATE OR REPLACE TABLE {staging_table} AS
                SELECT *, '{datetime.now().isoformat()}' as ingested_at
                FROM {read_func}
            """)
            
            row_count = con.execute(f"SELECT COUNT(*) FROM {staging_table}").fetchone()[0]
            print(f"  Loaded {row_count} rows into {staging_table}")
            
        except Exception as e:
            print(f"  Error loading {data_file.name}: {e}")

    # Create main bronze.bids table with deduplication
    try:
        # Check if staging table exists
        staging_tables = con.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'bronze' AND table_name LIKE 'staging_%'
        """).fetchall()
        
        if staging_tables:
            # Get first staging table as base
            first_staging = f"bronze.{staging_tables[0][0]}"
            
            con.execute(f"""
                CREATE OR REPLACE TABLE bronze.bids AS
                SELECT *
                FROM (
                    SELECT *,
                        ROW_NUMBER() OVER (
                            PARTITION BY sequence_no
                            ORDER BY ingested_at DESC
                        ) as rn
                    FROM {first_staging}
                )
                WHERE rn = 1
            """)
            
            # Drop the rn column
            con.execute("ALTER TABLE bronze.bids DROP COLUMN rn")
            
            final_count = con.execute("SELECT COUNT(*) FROM bronze.bids").fetchone()[0]
            print(f"\nCreated bronze.bids with {final_count} unique records (deduplicated by sequence_no)")
            
    except Exception as e:
        print(f"Error creating bronze.bids: {e}")

    con.close()
    print("\nDone!")


if __name__ == "__main__":
    main()
