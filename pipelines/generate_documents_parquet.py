#!/usr/bin/env python3
"""
Generate documents_raw.parquet for dbt pipeline.
Creates metadata for demo PDF files so stg_documents model can run.
"""

import pandas as pd
from pathlib import Path

# Output path
OUTPUT_DIR = Path("data/raw")
OUTPUT_FILE = OUTPUT_DIR / "documents_raw.parquet"

# Demo documents metadata (matching columns expected by dbt gold_documents.sql)
# Expected columns: doc_id, filename, doc_type, content, created_at
DEMO_DOCUMENTS = [
    {
        "doc_id": "DOC-202512-C-0001",
        "filename": "DOC-202512-C-0001.pdf",
        "doc_type": "contract",
        "content": "Transaction Basic Contract. Payment Terms: End of month closing, End of next month payment. Late Fee: 14.6% per annum.",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-C-0002-JP",
        "filename": "DOC-202512-C-0002-JP.pdf",
        "doc_type": "contract",
        "content": "取引基本契約書。支払条件：月末締め翌月末払い。遅延損害金：年率14.6%。",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-PO-0001",
        "filename": "DOC-202512-PO-0001.pdf",
        "doc_type": "po",
        "content": "Purchase Order PO-202512-0001. Amount: 120,000,000 JPY. Delivery Date: 2026-03-31.",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-PO-0002-JP",
        "filename": "DOC-202512-PO-0002-JP.pdf",
        "doc_type": "po",
        "content": "発注書 PO-202512-0002。金額：85,000,000円。納期：2026年6月30日。",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-INV-0001",
        "filename": "DOC-202512-INV-0001.pdf",
        "doc_type": "invoice",
        "content": "Invoice INV-202512-0001. Due Date: 2026-01-31. Total: 10,500,000 JPY.",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-INV-0002-JP",
        "filename": "DOC-202512-INV-0002-JP.pdf",
        "doc_type": "invoice",
        "content": "請求書 INV-202512-0002。支払期日：2026年1月31日。合計：25,850,000円。",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-POL-0001",
        "filename": "DOC-202512-POL-0001.pdf",
        "doc_type": "policy",
        "content": "Internal Policy: Billing & Collection. Due Date + 1 Day: First Reminder. Due Date + 7 Days: Second Reminder. Due Date + 14 Days: Escalate to Management.",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-POL-0002-JP",
        "filename": "DOC-202512-POL-0002-JP.pdf",
        "doc_type": "policy",
        "content": "社内ルール：請求・入金管理。支払期日＋1営業日：一次督促。支払期日＋7日：二次督促。支払期日＋14日：経営者エスカレーション。",
        "created_at": "2025-12-21"
    }
]

def main():
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create DataFrame
    df = pd.DataFrame(DEMO_DOCUMENTS)
    
    # Save to parquet
    df.to_parquet(OUTPUT_FILE, index=False)
    
    print(f"Generated {len(df)} document metadata records")
    print(f"Columns: {list(df.columns)}")
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
