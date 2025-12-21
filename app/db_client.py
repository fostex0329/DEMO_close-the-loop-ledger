import duckdb
import pandas as pd
import streamlit as st

DB_PATH = "warehouse.duckdb"

@st.cache_resource
def get_connection():
    """
    Returns a read-only connection to the DuckDB warehouse.
    Uses cache_resource to ensure we don't reopen connections unnecessarily.
    """
    # read_only=True is important for concurrent access if multiple users were accessing,
    # though DuckDB file locking can be tricky.
    # For this demo app, we'll try read_only=True to avoid locking the file against dbt.
    conn = duckdb.connect(DB_PATH, read_only=True)
    return conn

def get_data(query: str) -> pd.DataFrame:
    """
    Executes a SQL query and returns the result as a Pandas DataFrame.
    """
    conn = get_connection()
    return conn.sql(query).df()

def get_kpis():
    """
    Get key metrics for the dashboard.
    """
    # Assuming gold_ledger is in main_gold schema or similar
    # Adjust schema based on dbt output.
    # We verified table is 'gold_ledger' in 'main_gold' schema.
    df = get_data("SELECT * FROM main_gold.gold_ledger")
    
    total_orders = len(df)
    total_amount = df['amount'].sum()
    
    # Simple statuses
    unbilled = df[df['billing_status'] == 'UNBILLED']['amount'].sum()
    
    # Mocking 'Overdue' logic if not strictly in column yet or using billing_status
    # For now, let's assume if there's an 'OVERDUE' status
    overdue = 0
    if 'billing_status' in df.columns:
         overdue = df[df['billing_status'] == 'OVERDUE']['amount'].sum()

    return {
        "total_orders": total_orders,
        "total_amount": total_amount,
        "unbilled": unbilled,
        "overdue": overdue
    }
