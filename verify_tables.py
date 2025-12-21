import duckdb

con = duckdb.connect("warehouse.duckdb")

print("--- Schemas ---")
print(con.sql("SELECT schema_name FROM information_schema.schemata").df())

print("\n--- Tables in main_gold ---")
try:
    print(con.sql("SELECT table_name FROM information_schema.tables WHERE table_schema='main_gold'").df())
    print("\n--- Sample Gold Ledger ---")
    print(con.sql("SELECT * FROM main_gold.gold_ledger LIMIT 5").df())
except Exception as e:
    print(e)
    # Try just gold schema
    try:
        print("Trying gold schema...")
        print(con.sql("SELECT * FROM gold.gold_ledger LIMIT 5").df())
    except Exception as e2:
        print(e2)
