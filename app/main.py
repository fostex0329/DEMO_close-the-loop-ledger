import streamlit as st
import pandas as pd
import db_client

st.set_page_config(
    page_title="Close the Loop Ledger",
    page_icon="📊",
    layout="wide"
)

st.title("Close the Loop Ledger 📊")
st.markdown("### 受注〜請求〜入金 管理ダッシュボード")

# KPI Section
kpis = db_client.get_kpis()

col1, col2, col3, col4 = st.columns(4)
col1.metric("総受注件数", f"{kpis['total_orders']} 件")
col1.caption("Total Orders")

col2.metric("総受注額", f"¥{kpis['total_amount']:,.0f}")
col2.caption("Total Amount")

col3.metric("未請求額", f"¥{kpis['unbilled']:,.0f}")
col3.caption("Unbilled Amount")

col4.metric("期限超過額 (Overdue)", f"¥{kpis['overdue']:,.0f}", delta=-kpis['overdue'], delta_color="inverse")
col4.caption("Action Required")

st.divider()

# Recent Orders
st.subheader("最新の受注状況 (直近5件)")
recent_orders = db_client.get_data("SELECT * FROM main_gold.gold_ledger ORDER BY order_date DESC LIMIT 5")
st.dataframe(recent_orders, use_container_width=True)

# Monthly Trend (Mock)
st.subheader("月次推移")
st.bar_chart(recent_orders.set_index("organization_name")["amount"])
