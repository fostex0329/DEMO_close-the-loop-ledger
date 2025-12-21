from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import shutil
import urllib.request
from pathlib import Path

# Configuration
OUTPUT_DIR = "data/documents"
FONT_DIR = "data/fonts"
NOTO_FONT_URL = "https://github.com/notofonts/noto-cjk/raw/main/Sans/Variable/TTF/NotoSansCJKjp-VF.ttf"
NOTO_FONT_LOCAL = Path(FONT_DIR) / "NotoSansCJKjp-VF.ttf"

def setup_dir():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    os.makedirs(FONT_DIR, exist_ok=True)

def download_font():
    """Download Noto Sans JP if not present."""
    if NOTO_FONT_LOCAL.exists():
        print("Font already downloaded.")
        return True
    try:
        print(f"Downloading Japanese font from {NOTO_FONT_URL}...")
        urllib.request.urlretrieve(NOTO_FONT_URL, NOTO_FONT_LOCAL)
        print("Font downloaded successfully.")
        return True
    except Exception as e:
        print(f"Failed to download font: {e}")
        return False

def register_font():
    """Register the Japanese font with ReportLab."""
    try:
        pdfmetrics.registerFont(TTFont('NotoSansJP', str(NOTO_FONT_LOCAL)))
        return True
    except Exception as e:
        print(f"Failed to register font: {e}")
        return False

def create_pdf(filename, content_data, use_japanese_font=False):
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    
    if use_japanese_font:
        c.setFont('NotoSansJP', 10)
    else:
        c.setFont('Helvetica', 10)
    
    y = 800
    for line in content_data:
        c.drawString(50, y, line)
        y -= 18
        if y < 50:
            c.showPage()
            if use_japanese_font:
                c.setFont('NotoSansJP', 10)
            else:
                c.setFont('Helvetica', 10)
            y = 800
            
    c.save()
    print(f"Created {filepath}")

def generate_docs():
    setup_dir()
    
    # Download and register Japanese font
    has_jp_font = download_font() and register_font()
    
    # ========== ENGLISH DOCUMENTS ==========
    
    # 1. Contract (English)
    create_pdf("DOC-202512-C-0001.pdf", [
        "DEMO DOCUMENT - NOT REAL",
        "Transaction Basic Contract",
        "==========================",
        "Parties: Sample Corp (Buyer) and Demo Production Inc (Seller)",
        "Date: 2025-12-01",
        "",
        "Article 1 (Purpose)",
        "This contract governs the production and operation support services.",
        "",
        "Article 2 (Payment Terms) [KEY FOR RAG]",
        "1. Closing Date: End of each month.",
        "2. Invoice Date: Within 5 business days after closing.",
        "3. Payment Due Date: End of the following month (Net 30).",
        "4. Method: Bank Transfer. Buyer pays transfer fees.",
        "",
        "Article 3 (Inspection)",
        "Inspection Period: Within 10 business days of delivery.",
        "Deemed Acceptance: If no objection is raised within the period.",
        "",
        "Article 4 (Late Payment)",
        "Late Fee: 14.6% per annum.",
        "Policy: Seller shall remind Buyer on the next business day after due date."
    ], use_japanese_font=False)

    # 2. PO (English)
    create_pdf("DOC-202512-PO-0001.pdf", [
        "DEMO DOCUMENT - NOT REAL",
        "Purchase Order (PO)",
        "===================",
        "PO Number: PO-202512-0001",
        "Related Order: ORDER-202512-001",
        "Date: 2025-12-10",
        "",
        "Item: System Modernization Project (Phase 1)",
        "Amount: 120,000,000 JPY",
        "Delivery Date: 2026-03-31",
        "",
        "Terms:",
        "- Payment: As per Basic Contract (End of month closing, End of next month payment).",
        "- Inspection: Required."
    ], use_japanese_font=False)
    
    # 3. Invoice (English)
    create_pdf("DOC-202512-INV-0001.pdf", [
        "DEMO DOCUMENT - NOT REAL",
        "INVOICE",
        "=======",
        "Invoice No: INV-202512-0001",
        "Date: 2025-12-31",
        "Due Date: 2026-01-31",
        "To: Sample Corp",
        "",
        "Description:",
        "1. System Modernization Initial Payment ... 10,000,000 JPY",
        "2. Cloud Service Fee (Dec) ................ 500,000 JPY",
        "",
        "Total: 10,500,000 JPY + Tax",
        "",
        "Bank Info:",
        "Demo Bank, Sample Branch",
        "Account: 1234567"
    ], use_japanese_font=False)

    # 4. Policy (English)
    create_pdf("DOC-202512-POL-0001.pdf", [
        "DEMO DOCUMENT - NOT REAL",
        "Internal Policy: Billing & Collection",
        "=====================================",
        "Scope: All Projects",
        "",
        "1. Closing Procedure",
        "- Check exceptions every Monday at 10:00 AM.",
        "- Confirm billing status by month-end.",
        "",
        "2. Collection Flow (Overdue)",
        "- Due Date + 1 Day: First Reminder (Email)",
        "- Due Date + 7 Days: Second Reminder (Phone)",
        "- Due Date + 14 Days: Escalate to Management",
        "",
        "3. Exception Handling",
        "- If Inspection is incomplete, prioritize getting acceptance over billing."
    ], use_japanese_font=False)
    
    # ========== JAPANESE DOCUMENTS ==========
    if has_jp_font:
        # 5. Contract (Japanese)
        create_pdf("DOC-202512-C-0002-JP.pdf", [
            "【デモ文書・非実在】",
            "取引基本契約書",
            "========================",
            "甲：株式会社サンプル（発注者）",
            "乙：株式会社デモ制作（受注者）",
            "契約日：2025年12月1日",
            "",
            "第1条（目的）",
            "本契約は、制作および運用支援業務に関する取引条件を定める。",
            "",
            "第2条（支払条件）【RAG重要項目】",
            "1. 請求締め日：毎月末日",
            "2. 請求書発行日：締め日から5営業日以内",
            "3. 支払期日：請求書発行日の翌月末日（Net 30相当）",
            "4. 支払方法：銀行振込。振込手数料は甲負担。",
            "",
            "第3条（検収）",
            "検収期間：納品日から10営業日以内。",
            "みなし検収：期間内に異議がない場合は検収完了とする。",
            "",
            "第4条（遅延損害金）",
            "遅延損害金：年率14.6%",
            "督促：乙は支払期日翌営業日に甲へ通知する。"
        ], use_japanese_font=True)

        # 6. PO (Japanese)
        create_pdf("DOC-202512-PO-0002-JP.pdf", [
            "【デモ文書・非実在】",
            "発注書",
            "========================",
            "発注番号：PO-202512-0002",
            "関連案件：ORDER-202512-002",
            "発注日：2025年12月15日",
            "",
            "件名：クラウド基盤構築プロジェクト",
            "金額：85,000,000円（税別）",
            "納期：2026年6月30日",
            "",
            "条件：",
            "・支払条件：基本契約に準ずる（月末締め翌月末払い）",
            "・検収：必須"
        ], use_japanese_font=True)

        # 7. Invoice (Japanese)
        create_pdf("DOC-202512-INV-0002-JP.pdf", [
            "【デモ文書・非実在】",
            "請求書",
            "========================",
            "請求番号：INV-202512-0002",
            "請求日：2025年12月31日",
            "支払期日：2026年1月31日",
            "請求先：株式会社サンプル 御中",
            "",
            "内訳：",
            "1. クラウド基盤設計費 .......... 15,000,000円",
            "2. 初期構築費（12月分）........ 8,500,000円",
            "",
            "小計：23,500,000円",
            "消費税（10%）：2,350,000円",
            "合計：25,850,000円",
            "",
            "振込先：",
            "デモ銀行 サンプル支店",
            "普通 1234567",
            "カ）デモセイサク"
        ], use_japanese_font=True)

        # 8. Policy (Japanese)
        create_pdf("DOC-202512-POL-0002-JP.pdf", [
            "【デモ文書・非実在】",
            "社内ルール：請求・入金管理",
            "========================",
            "適用範囲：全案件",
            "",
            "1. 締め手順",
            "・毎週月曜 10:00：例外一覧を確認（未請求/期限超過/差異）",
            "・月末：請求対象確定（検収済み案件のみ）",
            "・翌月5営業日以内：請求書送付",
            "",
            "2. 督促フロー【RAG重要項目】",
            "・支払期日＋1営業日：一次督促（メール）",
            "・支払期日＋7日：二次督促（電話/書面）",
            "・支払期日＋14日：経営者エスカレーション（停止判断）",
            "",
            "3. 例外時の判断基準",
            "・検収未了：督促ではなく検収依頼を優先",
            "・請求差異：請求書再発行 or 見積差分の確認"
        ], use_japanese_font=True)
        
        print(f"\nGenerated {8} documents (4 English + 4 Japanese)")
    else:
        print(f"\nGenerated {4} documents (English only, Japanese font not available)")

if __name__ == "__main__":
    generate_docs()
