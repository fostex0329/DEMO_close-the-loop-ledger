import pandas as pd
import os
from pathlib import Path
from datetime import datetime

# Configuration
DATA_DIR = Path("data/raw")
SOURCE_FILE = DATA_DIR / "bids_source.csv"
OUTPUT_FILE = DATA_DIR / "bids_raw.parquet"

def create_sample_bids_csv():
    """Create a sample CSV if source doesn't exist for demo purposes."""
    print(f"Creating sample data at {SOURCE_FILE}...")
    
    # Sample data matching Procurement Portal structure somewhat
    data = {
        "sequence_no": [1, 2, 3],
        "organization_name": ["国土交通省", "財務省", "デジタル庁"],
        "procurement_name": ["庁舎清掃業務", "システム更改", "クラウド利用料"],
        "contract_date": ["2025-12-01", "2025-12-05", "2025-12-10"],
        "contractor_name": ["株式会社クリーン", "株式会社テック", "クラウドサービス株式会社"],
        "contract_amount": [5000000, 120000000, 3000000],
        "corporate_number": ["1234567890123", "9876543210987", "1111222233334"] 
    }
    df = pd.DataFrame(data)
    df.to_csv(SOURCE_FILE, index=False, encoding="utf-8")
    print("Sample data created.")

def run_pipeline():
    # Ensure directory exists
    os.makedirs(DATA_DIR, exist_ok=True)

    # 1. Check for source file
    if not SOURCE_FILE.exists():
        print(f"Source file {SOURCE_FILE} not found.")
        create_sample_bids_csv()

    # 2. Load and Transform
    print(f"Loading {SOURCE_FILE}...")
    try:
        df = pd.read_csv(SOURCE_FILE)
        
        # Add metadata
        df["snapshot_date"] = datetime.now().date()
        
        # 3. Save as Parquet
        print(f"Saving to {OUTPUT_FILE}...")
        df.to_parquet(OUTPUT_FILE, index=False)
        print("Success! Bids data pipeline completed.")
        
    except Exception as e:
        print(f"Error processing bids data: {e}")

if __name__ == "__main__":
    run_pipeline()
