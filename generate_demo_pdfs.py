# -*- coding: utf-8 -*-
"""Generate demo PDFs for RAG (contract/po/invoice/policy).

Usage:
  pip install reportlab pandas
  python generate_demo_pdfs.py

Outputs are created in the current directory.
"""

from pathlib import Path
import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

try:
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
    FONT = "HeiseiKakuGo-W5"
except Exception:
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiMin-W3"))
    FONT = "HeiseiMin-W3"

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
MARGIN_Y = 18 * mm
LINE_GAP = 6.2 * mm

def draw_header(c: canvas.Canvas, title: str):
    c.setFont(FONT, 12)
    c.drawString(MARGIN_X, PAGE_H - MARGIN_Y, "DEMO / 学習・検証用（実取引ではない）")
    c.setFont(FONT, 16)
    c.drawString(MARGIN_X, PAGE_H - MARGIN_Y - 10*mm, title)
    c.setLineWidth(0.8)
    c.line(MARGIN_X, PAGE_H - MARGIN_Y - 12*mm, PAGE_W - MARGIN_X, PAGE_H - MARGIN_Y - 12*mm)

def draw_section(c: canvas.Canvas, y: float, heading: str, lines: list[str]) -> float:
    c.setFont(FONT, 12)
    c.drawString(MARGIN_X, y, f"■ {heading}")
    y -= 7.5*mm
    c.setFont(FONT, 10.5)
    for line in lines:
        s = line
        while len(s) > 55:
            c.drawString(MARGIN_X + 6*mm, y, s[:55])
            s = s[55:]
            y -= LINE_GAP
        c.drawString(MARGIN_X + 6*mm, y, s)
        y -= LINE_GAP
    y -= 2.5*mm
    return y

def make_contract_pdf(path: Path, meta: dict):
    c = canvas.Canvas(str(path), pagesize=A4)
    draw_header(c, "取引基本契約書（デモ用）")
    y = PAGE_H - MARGIN_Y - 20*mm
    y = draw_section(c, y, "当事者・基本情報", [
        f"契約ID：{meta['doc_id']}",
        f"甲（発注者）：{meta['client_name']}",
        f"乙（受注者）：{meta['vendor_name']}",
        f"契約開始日：{meta['effective_date']}",
        "契約の目的：業務委託（制作／運用／開発 等）",
    ])
    y = draw_section(c, y, "支払条件（重要）", [
        "請求締め日：毎月末日",
        "請求書発行日：締め日から5営業日以内",
        "支払期日：請求書発行日の翌月末日",
        "支払方法：銀行振込",
        "振込手数料：甲負担",
    ])
    y = draw_section(c, y, "検収条件", [
        "検収対象：納品物一式",
        "検収期間：納品日から10営業日",
        "検収完了：甲のメール承認、または期間内に異議がない場合",
    ])
    y = draw_section(c, y, "遅延時の扱い", [
        "遅延損害金：年率 14.6%",
        "期限超過時：乙は支払期日翌営業日に一次督促（メール）を行う",
    ])
    y = draw_section(c, y, "特記事項", [
        "個別契約（発注書）に個別指定がある場合は、当該条件を優先する。",
        "本書はデモ用テンプレであり、実取引・法務判断には利用しない。",
    ])
    c.showPage()
    c.save()

def make_po_pdf(path: Path, meta: dict):
    c = canvas.Canvas(str(path), pagesize=A4)
    draw_header(c, "発注書（PO / デモ用）")
    y = PAGE_H - MARGIN_Y - 20*mm
    y = draw_section(c, y, "発注情報", [
        f"文書ID：{meta['doc_id']}",
        f"発注番号：{meta['po_number']}",
        f"関連案件キー：{meta['related_order_key']}",
        f"発注日：{meta['po_date']}",
        f"発注者：{meta['client_name']}",
        f"受注者：{meta['vendor_name']}",
        f"件名：{meta['subject']}",
    ])
    y = draw_section(c, y, "条件", [
        f"金額（税込）：{meta['amount_jpy']}",
        f"納期：{meta['due_date']}",
        "納品物：①レポート一式 ②設定ファイル ③運用手順（各1式）",
        "検収条件：取引基本契約に準ずる（検収期間：10営業日）",
        "支払条件：取引基本契約に準ずる（請求書発行日の翌月末日払い）",
    ])
    y = draw_section(c, y, "備考", [
        "本発注書はデモ用テンプレであり、実取引には利用しない。",
    ])
    c.showPage()
    c.save()

def make_invoice_pdf(path: Path, meta: dict):
    c = canvas.Canvas(str(path), pagesize=A4)
    draw_header(c, "請求書（デモ用）")
    y = PAGE_H - MARGIN_Y - 20*mm
    y = draw_section(c, y, "請求情報", [
        f"請求番号：{meta['invoice_number']}",
        f"文書ID：{meta['doc_id']}",
        f"関連案件キー：{meta['related_order_key']}",
        f"請求日：{meta['invoice_date']}",
        f"支払期日：{meta['payment_due_date']}",
        f"請求先：{meta['client_name']} 御中",
        f"発行者：{meta['vendor_name']}",
    ])
    y = draw_section(c, y, "請求内訳", [
        "項目A：制作/設定費　数量1　単価 ¥550,000　金額 ¥550,000",
        "項目B：運用費（当月分）　数量1　単価 ¥220,000　金額 ¥220,000",
        "小計：¥770,000",
        "消費税（10%）：¥77,000",
        "合計：¥847,000",
    ])
    y = draw_section(c, y, "振込先（ダミー）", [
        "銀行名：デモ銀行　支店：サンプル支店",
        "口座種別：普通　口座番号：0000000",
        "口座名義：カ）デモセイサク",
        "※本情報はデモ用の架空情報です。",
    ])
    c.showPage()
    c.save()

def make_policy_pdf(path: Path, meta: dict):
    c = canvas.Canvas(str(path), pagesize=A4)
    draw_header(c, "請求・入金管理ルール（デモ用）")
    y = PAGE_H - MARGIN_Y - 20*mm
    y = draw_section(c, y, "適用範囲", [
        "対象：全案件（受注台帳に登録されたもの）",
        "目的：請求漏れ・入金漏れを防ぎ、締め作業を週1回の確認にする",
    ])
    y = draw_section(c, y, "締めの手順", [
        "毎週月曜 10:00：例外一覧（未請求/期限超過/差異）を確認",
        "月末：請求対象確定（検収済み案件のみ）",
        "翌月5営業日以内：請求書送付",
    ])
    y = draw_section(c, y, "督促フロー", [
        "支払期日＋1営業日：一次督促（メール）",
        "支払期日＋7日：二次督促（電話/書面）",
        "支払期日＋14日：経営者エスカレーション（取引停止判断含む）",
    ])
    y = draw_section(c, y, "例外時の判断基準", [
        "検収未了：督促ではなく検収依頼を優先する",
        "請求差異：請求書再発行、または見積差分を確認する",
        "相手都合の遅延：記録し、次回条件見直し（支払サイト短縮等）を検討する",
    ])
    y = draw_section(c, y, "注意", [
        "本書はデモ用テンプレであり、実運用には各社の規程に合わせて調整する。",
    ])
    c.showPage()
    c.save()

def main():
    out_dir = Path(".")
    scenario = {
        "related_order_key": "ORDER-202512-0001",
        "client_name": "株式会社サンプル",
        "vendor_name": "株式会社デモ制作",
    }

    metadata_rows = []

    contract_meta = {**scenario, "doc_id": "DOC-202512-C-0001", "effective_date": "2025-12-01"}
    make_contract_pdf(out_dir / "demo_contract_DOC-202512-C-0001.pdf", contract_meta)
    metadata_rows.append({
        "doc_id": contract_meta["doc_id"],
        "doc_type": "contract",
        "title": "取引基本契約書（デモ用）",
        "related_order_key": "",
        "vendor_name": scenario["vendor_name"],
        "vendor_id": "",
        "effective_date": contract_meta["effective_date"],
        "filename": "demo_contract_DOC-202512-C-0001.pdf"
    })

    po_meta = {**scenario, "doc_id": "DOC-202512-PO-0001", "po_number": "PO-202512-0001",
               "po_date": "2025-12-10", "subject": "請求・入金管理ミニ基盤 構築支援（デモ案件）",
               "amount_jpy": "¥847,000", "due_date": "2025-12-25"}
    make_po_pdf(out_dir / "demo_po_DOC-202512-PO-0001.pdf", po_meta)
    metadata_rows.append({
        "doc_id": po_meta["doc_id"],
        "doc_type": "po",
        "title": "発注書（PO / デモ用）",
        "related_order_key": scenario["related_order_key"],
        "vendor_name": scenario["vendor_name"],
        "vendor_id": "",
        "effective_date": po_meta["po_date"],
        "filename": "demo_po_DOC-202512-PO-0001.pdf"
    })

    inv_meta = {**scenario, "doc_id": "DOC-202512-INV-0001", "invoice_number": "INV-202512-0001",
                "invoice_date": "2025-12-26", "payment_due_date": "2026-01-31"}
    make_invoice_pdf(out_dir / "demo_invoice_DOC-202512-INV-0001.pdf", inv_meta)
    metadata_rows.append({
        "doc_id": inv_meta["doc_id"],
        "doc_type": "invoice",
        "title": "請求書（デモ用）",
        "related_order_key": scenario["related_order_key"],
        "vendor_name": scenario["vendor_name"],
        "vendor_id": "",
        "effective_date": inv_meta["invoice_date"],
        "filename": "demo_invoice_DOC-202512-INV-0001.pdf"
    })

    policy_meta = {**scenario, "doc_id": "DOC-202512-POL-0001"}
    make_policy_pdf(out_dir / "demo_policy_DOC-202512-POL-0001.pdf", policy_meta)
    metadata_rows.append({
        "doc_id": policy_meta["doc_id"],
        "doc_type": "policy",
        "title": "請求・入金管理ルール（デモ用）",
        "related_order_key": "",
        "vendor_name": "",
        "vendor_id": "",
        "effective_date": "2025-12-01",
        "filename": "demo_policy_DOC-202512-POL-0001.pdf"
    })

    pd.DataFrame(metadata_rows).to_csv(out_dir / "docs_metadata_demo.csv", index=False, encoding="utf-8")
    print("Generated PDFs + docs_metadata_demo.csv")

if __name__ == "__main__":
    main()
