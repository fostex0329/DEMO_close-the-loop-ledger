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

# Demo documents metadata (matching files in web/public/documents/)
DEMO_DOCUMENTS = [
    {
        "doc_id": "DOC-202512-C-0001",
        "doc_type": "contract",
        "title": "Transaction Basic Contract (Demo)",
        "file_path": "documents/DOC-202512-C-0001.pdf",
        "vendor_name": "Sample Corp",
        "effective_date": "2025-01-01",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-C-0002-JP",
        "doc_type": "contract",
        "title": "取引基本契約書（デモ用）",
        "file_path": "documents/DOC-202512-C-0002-JP.pdf",
        "vendor_name": "株式会社サンプル",
        "effective_date": "2025-01-01",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-PO-0001",
        "doc_type": "po",
        "title": "Purchase Order (Demo)",
        "file_path": "documents/DOC-202512-PO-0001.pdf",
        "vendor_name": "Demo Production Inc",
        "effective_date": "2025-12-01",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-PO-0002-JP",
        "doc_type": "po",
        "title": "発注書（デモ用）",
        "file_path": "documents/DOC-202512-PO-0002-JP.pdf",
        "vendor_name": "株式会社デモ制作",
        "effective_date": "2025-12-01",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-INV-0001",
        "doc_type": "invoice",
        "title": "Invoice (Demo)",
        "file_path": "documents/DOC-202512-INV-0001.pdf",
        "vendor_name": "Demo Production Inc",
        "effective_date": "2025-12-15",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-INV-0002-JP",
        "doc_type": "invoice",
        "title": "請求書（デモ用）",
        "file_path": "documents/DOC-202512-INV-0002-JP.pdf",
        "vendor_name": "株式会社デモ制作",
        "effective_date": "2025-12-15",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-POL-0001",
        "doc_type": "policy",
        "title": "Internal Policy: Billing & Collection (Demo)",
        "file_path": "documents/DOC-202512-POL-0001.pdf",
        "vendor_name": None,
        "effective_date": "2025-01-01",
        "created_at": "2025-12-21"
    },
    {
        "doc_id": "DOC-202512-POL-0002-JP",
        "doc_type": "policy",
        "title": "社内ルール：請求・入金管理（デモ用）",
        "file_path": "documents/DOC-202512-POL-0002-JP.pdf",
        "vendor_name": None,
        "effective_date": "2025-01-01",
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
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
