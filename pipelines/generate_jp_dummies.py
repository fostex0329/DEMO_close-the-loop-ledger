import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import datetime

# --- Configuration ---
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'documents')
FONT_PATH = '/System/Library/Fonts/Supplemental/AppleGothic.ttf'
FONT_NAME = 'AppleGothic'

def setup_font():
    try:
        pdfmetrics.registerFont(TTFont(FONT_NAME, FONT_PATH))
        return True
    except Exception as e:
        print(f"Failed to register font {FONT_PATH}: {e}")
        return False

def create_pdf(filename, title, content_lines, doc_id):
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    # Register font
    c.setFont(FONT_NAME, 10)
    
    # Header (Demo Warning)
    c.drawString(50, height - 30, "DEMO / 学習・検証用（実取引ではない）")
    if doc_id:
        c.drawString(400, height - 30, f"DocID: {doc_id}")
    
    # Title
    c.setFont(FONT_NAME, 18)
    c.drawString(50, height - 80, title)
    
    # Content
    c.setFont(FONT_NAME, 11)
    y = height - 120
    line_height = 16
    
    for line in content_lines:
        if line == "---":
            y -= 10
            continue
        
        # Check for page break
        if y < 50:
            c.showPage()
            c.setFont(FONT_NAME, 10)
            c.drawString(50, height - 30, "DEMO / 学習・検証用（実取引ではない）")
            c.setFont(FONT_NAME, 11)
            y = height - 80

        c.drawString(50, y, line)
        y -= line_height

    c.save()
    print(f"Generated: {filepath}")

def generate_dummies():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    font_ok = setup_font()
    if not font_ok:
        print("Skipping generation due to font error.")
        return

    # 1. 契約書 (Contract)
    create_pdf(
        "DOC-JP-CONTRACT-001.pdf",
        "取引基本契約書（デモ用）",
        [
            "甲：株式会社サンプル（発注者）",
            "乙：株式会社デモ制作（受注者）",
            "契約開始日：2025-01-01",
            "---",
            "【第1条 目的】",
            "甲は乙に対し、Web制作および運用業務を委託し、乙はこれを受託する。",
            "",
            "【第2条 支払条件】",
            "1. 請求締め日：毎月末日とする。",
            "2. 請求書発行：乙は締め日から5営業日以内に請求書を発行・送付する。",
            "3. 支払期日：請求書発行月の翌月末日（Net 30）とする。",
            "4. 支払方法：銀行振込とする。振込手数料は甲の負担とする。",
            "",
            "【第3条 検収】",
            "1. 乙は納品後、甲に検収を依頼する。",
            "2. 甲は納品日から10営業日以内に検収を行う。",
            "3. 期間内に異議が申し立てられない場合、検収完了とみなす。",
            "",
            "【第4条 遅延損害金】",
            "支払が遅延した場合、年率14.6%の遅延損害金を請求できるものとする。",
        ],
        "DOC-JP-CONTRACT-001"
    )

    # 2. 発注書 (PO)
    create_pdf(
        "DOC-JP-PO-202512-01.pdf",
        "発注書",
        [
            "発注番号：PO-202512-0001",
            "発注日：2025-12-10",
            "甲：株式会社サンプル",
            "乙：株式会社デモ制作",
            "---",
            "件名：Webシステム・リニューアル案件（Phase 1）",
            "金額：5,000,000円（税別）",
            "消費税：500,000円",
            "合計：5,500,000円",
            "",
            "納期：2026-03-31",
            "納品場所：甲の指定するサーバー",
            "支払条件：基本契約（DOC-JP-CONTRACT-001）に準ずる。",
            "特記事項：初回着手金として、当月末に10%を請求可とする。",
        ],
        "DOC-JP-PO-202512-01"
    )

    # 3. 請求書 (Invoice)
    create_pdf(
        "DOC-JP-INV-202512-01.pdf",
        "請求書",
        [
            "請求番号：INV-202512-0001",
            "請求日：2025-12-31",
            "請求先：株式会社サンプル 御中",
            "請求元：株式会社デモ制作",
            "---",
            "件名：12月度　着手金ご請求",
            "お支払期限：2026-01-31",
            "",
            "【ご請求金額】",
            "　小計：500,000 円",
            "　消費税：50,000 円",
            "　合計：550,000 円",
            "",
            "【内訳】",
            "1. Webシステム・リニューアル 着手金（10%） ... 500,000円",
            "",
            "【お振込先】",
            "銀行名：デモ銀行",
            "支店名：サンプル支店",
            "口座種別：普通",
            "口座番号：1234567",
            "口座名義：カ）デモセイサク",
        ],
        "DOC-JP-INV-202512-01"
    )

    # 4. 社内ルール (Internal Rule)
    create_pdf(
        "DOC-JP-RULE-001.pdf",
        "請求・入金管理ルール",
        [
            "適用範囲：全プロジェクト",
            "制定日：2024-04-01",
            "---",
            "【1. 請求フロー】",
            "- 担当者は毎月末に「未請求一覧」を確認すること。",
            "- 原則として、検収完了メールを受領後に請求書を発行する。",
            "",
            "【2. 督促フロー】",
            "- 支払期日を1日過ぎた場合：担当者がメールで一次督促を行う。",
            "- 支払期日を7日過ぎた場合：電話にて確認し、経理責任者に報告する。",
            "- 14日以上遅延する場合：取引停止判断を行う。",
            "",
            "【3. 例外対応】",
            "- 金額不一致の場合：直ちに見積書との差分を確認し、再発行を行う。",
        ],
        "DOC-JP-RULE-001"
    )

if __name__ == "__main__":
    generate_dummies()
