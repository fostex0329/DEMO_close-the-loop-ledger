import pandas as pd
import os
from pathlib import Path
from datetime import datetime

# Configuration
DATA_DIR = Path("data/raw")
SOURCE_FILE = DATA_DIR / "corporate_source.csv"
OUTPUT_FILE = DATA_DIR / "corporate_raw.parquet"

def create_sample_corporate_csv():
    """Create a sample CSV if source doesn't exist for demo purposes."""
    print(f"Creating sample data at {SOURCE_FILE}...")
    
    # Sample corporate data
    data = {
        "corporate_number": ["1234567890123", "9876543210987", "1111222233334"],
        "corporate_name": ["株式会社クリーン", "株式会社テック", "クラウドサービス株式会社"],
        "address_prefecture": ["東京都", "神奈川県", "大阪府"],
        "address_city": ["千代田区", "横浜市", "大阪市"]
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
        create_sample_corporate_csv()

    # 2. Load and Transform
    print(f"Loading {SOURCE_FILE}...")
    try:
        df = pd.read_csv(SOURCE_FILE)
        
        # Add metadata
        df["snapshot_date"] = datetime.now().date()
        
        # 3. Save as Parquet
        print(f"Saving to {OUTPUT_FILE}...")
        df.to_parquet(OUTPUT_FILE, index=False)
        print("Success! Corporate data pipeline completed.")
        
    except Exception as e:
        print(f"Error processing corporate data: {e}")

if __name__ == "__main__":
    run_pipeline()
