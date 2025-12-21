import duckdb

con = duckdb.connect("warehouse.duckdb")
print("Tables:", con.sql("SHOW TABLES").fetchall())
print("\nGold Ledger Sample:")
print(con.sql("SELECT * FROM gold_ledger LIMIT 5").df())
