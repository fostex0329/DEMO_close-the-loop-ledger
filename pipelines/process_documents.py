import os
import pandas as pd
from pypdf import PdfReader
from pathlib import Path
from datetime import datetime

# Configuration
DOCS_DIR = Path("data/documents")
OUTPUT_FILE = Path("data/raw/documents_raw.parquet")

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def process_documents():
    if not DOCS_DIR.exists():
        print(f"Documents directory {DOCS_DIR} does not exist.")
        return

    records = []
    
    for pdf_file in DOCS_DIR.glob("*.pdf"):
        print(f"Processing {pdf_file.name}...")
        
        # Simple chunking: Treat entire file as one chunk for this MVP
        # Or split by blank lines if we really wanted to.
        # For simplicity in MVP RAG, let's keep it document-level or page-level.
        # Spec says "chunking", let's do simple naive text chunking.
        
        full_text = extract_text_from_pdf(pdf_file)
        
        # Metadata logic (naive parsing from filename)
        # DOC-YYYYMM-[TYPE]-[SEQ].pdf
        parts = pdf_file.stem.split("-")
        doc_type = "unknown"
        if len(parts) >= 3:
            type_code = parts[2]
            if type_code == "C": doc_type = "contract"
            elif type_code == "PO": doc_type = "po"
            elif type_code == "INV": doc_type = "invoice"
            elif type_code == "POL": doc_type = "policy"
            
        # Create a record
        records.append({
            "doc_id": pdf_file.stem,
            "filename": pdf_file.name,
            "doc_type": doc_type,
            "content": full_text,
            "created_at": datetime.now(),
            "file_size": pdf_file.stat().st_size
        })
        
    if not records:
        print("No documents found to process.")
        return

    df = pd.DataFrame(records)
    
    # Ensure raw directory exists
    os.makedirs(OUTPUT_FILE.parent, exist_ok=True)
    
    df.to_parquet(OUTPUT_FILE, index=False)
    print(f"Saved {len(df)} documents to {OUTPUT_FILE}")

if __name__ == "__main__":
    process_documents()
