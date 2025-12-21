import duckdb
import sys
import json
import os

# Adjust DB_PATH to be relative to where the script is located or cwd?
# In db.ts, we used path.join(process.cwd(), '..', 'warehouse.duckdb').
# Assuming this script is run from project root or similar. 
# Let's use an absolute path logic based on this script's location.
# Script is in web/src/lib/query_duckdb.py
# Warehouse is in warehouse.duckdb (project root)

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # web/src/lib
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..', '..', '..')) # project root
DB_PATH = os.path.join(PROJECT_ROOT, 'warehouse.duckdb')

def run_query():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return

        payload = json.loads(input_data)
        sql = payload.get("sql")
        params = payload.get("params", [])

        if not sql:
            print(json.dumps({"error": "No SQL provided"}))
            return

        # Connect to DuckDB
        # read_only=True is much safer for concurrent access
        con = duckdb.connect(DB_PATH, read_only=True)
        
        # Execute
        # DuckDB python execute syntax: con.execute(sql, parameters)
        # Results can be fetched as list of tuples using fetchall()
        # But we want objects/dicts for JSON.
        # df() returns a pandas dataframe
        # fetch_df() is also available.
        # Let's inspect column names first or use fetchall and map.
        
        rel = con.execute(sql, params)
        
        # Get column names
        columns = [desc[0] for desc in rel.description]
        
        rows = rel.fetchall()
        
        results = []
        for row in rows:
            record = {}
            for i, col in enumerate(columns):
                # Handle types that might not serialize well to JSON
                # e.g. dates, though JSON serializer can custom handle them
                val = row[i]
                # Simple datetime string conversion
                if hasattr(val, 'isoformat'):
                    val = val.isoformat()
                record[col] = val
            results.append(record)
            
        con.close()
        
        print(json.dumps({"data": results}))

    except Exception as e:
        # Print error in JSON format so caller can parse it
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    run_query()
