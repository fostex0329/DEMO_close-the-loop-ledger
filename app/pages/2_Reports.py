import streamlit as st
import db_client
from datetime import datetime

st.set_page_config(page_title="週次レポート", page_icon="📅")

st.title("週次レポート生成 (Weekly Report)")

if st.button("レポートを生成する"):
    with st.spinner("Generating report..."):
        # Fetch data
        kpis = db_client.get_kpis()
        exceptions = db_client.get_data("SELECT * FROM main_gold.gold_ledger WHERE billing_status = 'UNBILLED' OR billing_status = 'OVERDUE'")
        
        # Determine health
        health = "🟢 正常"
        if kpis['overdue'] > 0:
            health = "🔴 要注意 (期限超過あり)"
        elif kpis['unbilled'] > 0:
            health = "🟡 注意 (未請求あり)"
            
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Report Template
        report_md = f"""
## 週次ステータスレポート ({today})

**全体ステータス**: {health}

### 1. サマリ
- **未回収額**: ¥{kpis['unbilled'] + kpis['overdue']:,.0f} (内、期限超過: ¥{kpis['overdue']:,.0f})
- **新規受注**: (今週分のロジックは未実装ですが、ここに表示予定)
- **アクション**: {len(exceptions)} 件の対応が必要です。

### 2. 要対応リスト (Top 5)
以下の案件について確認をお願いします。
"""
        st.markdown(report_md)
        st.dataframe(exceptions.head(5)[['organization_name', 'procurement_name', 'amount', 'billing_status']])
        
        st.info("このレポートをコピーしてSlack/Chatworkに貼り付けてください。")

