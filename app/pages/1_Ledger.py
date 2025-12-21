import streamlit as st
import db_client

st.set_page_config(page_title="受注台帳", page_icon="📑", layout="wide")

st.title("受注台帳 (Order Ledger)")

# Sidebar Filters
st.sidebar.header("Filter Options")
status_filter = st.sidebar.multiselect("Billing Status", ["UNBILLED", "BILLED", "PAID", "OVERDUE", "INVALID"])

# Query Construction
query = "SELECT * FROM main_gold.gold_ledger WHERE 1=1"
if status_filter:
    status_list = "', '".join(status_filter)
    query += f" AND billing_status IN ('{status_list}')"

df = db_client.get_data(query)

st.dataframe(
    df,
    column_config={
        "amount": st.column_config.NumberColumn("Amount", format="¥%d"),
        "order_date": st.column_config.DateColumn("Date"),
        "billing_status": st.column_config.TextColumn("Status"),
    },
    use_container_width=True, 
    height=600
)
