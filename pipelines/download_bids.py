import requests
import pandas as pd
import io
import zipfile
import os
from pathlib import Path
from datetime import datetime

# Configuration
DATA_DIR = Path("data/raw")
OUTPUT_FILE = DATA_DIR / "bids_raw.parquet"
API_BASE_URL = "https://api.p-portal.go.jp/pps-web-biz/UAB03/OAB0301"

# Column Mapping by Index (0-based)
# Based on inspection:
# 0: ID, 1: Name, 2: Date, 3: Amount, 4: MinistryCode, 5: BidMethod?, 6: Contractor, 7: CorpID
COLUMN_INDICES = {
    0: "sequence_no",
    1: "procurement_name",
    2: "contract_date",
    3: "contract_amount",
    4: "organization_name", # Storing code here for now
    6: "contractor_name",
    7: "corporate_number"
}

def download_and_process():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    current_year = datetime.now().year
    target_years = [current_year, current_year - 1]
    
    for year in target_years:
        filename = f"successful_bid_record_info_all_{year}.zip"
        download_url = f"{API_BASE_URL}?fileversion=v001&filename={filename}"
        print(f"Trying to download: {download_url}...")
        
        try:
            resp = requests.get(download_url)
            if resp.status_code == 200:
                print(f"Download successful for year {year}!")
                process_response(resp)
                return
            else:
                print(f"Failed to download for year {year}. Status: {resp.status_code}")
        except Exception as e:
            print(f"Error downloading year {year}: {e}")

    print("Failed to download data for all attempted years.")

def process_response(resp):
    try:
        with zipfile.ZipFile(io.BytesIO(resp.content)) as z:
            csv_files = [f for f in z.namelist() if f.endswith('.csv')]
            if not csv_files:
                print("No CSV found in ZIP.")
                return
            
            target_csv = csv_files[0]
            print(f"Processing CSV from ZIP: {target_csv}")
            
            with z.open(target_csv) as f:
                # Read CSV without header, force strings for IDs
                # Use utf-8-sig for BOM
                try:
                    df = pd.read_csv(f, encoding='utf-8-sig', header=None, dtype=str)
                except UnicodeDecodeError:
                    f.seek(0)
                    df = pd.read_csv(f, encoding='cp932', header=None, dtype=str)
                
        print(f"Raw data loaded: {len(df)} rows.")
        
        # Select and Rename Columns
        # Create a new DF with the mapped columns
        new_df = pd.DataFrame()
        
        for idx, name in COLUMN_INDICES.items():
            if idx < len(df.columns):
                new_df[name] = df[idx]
        
        df = new_df
        
        # Data Cleaning
        if "contract_date" in df.columns:
             df["contract_date"] = pd.to_datetime(df["contract_date"], errors='coerce').dt.date
        
        if "contract_amount" in df.columns:
            # Handle possible commas or non-numeric
            df["contract_amount"] = (
                df["contract_amount"]
                .astype(str)
                .str.replace(',', '')
                .apply(pd.to_numeric, errors='coerce')
            )
        
        # Add metadata
        df["snapshot_date"] = datetime.now().date()
        
        # Save
        print(f"Saving to {OUTPUT_FILE}...")
        df.to_parquet(OUTPUT_FILE, index=False)
        print("Success! Real procurement data pipeline completed.")

    except Exception as e:
        print(f"Processing failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    download_and_process()
