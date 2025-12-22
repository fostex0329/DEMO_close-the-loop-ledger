# Close the Loop Ledger (Demo)

**受発注・請求・入金 管理ミニ基盤（日本語オープンデータ版）**

> "締めの不安を、週1回の確認だけで済む状態にする"

このプロジェクトは、**「入力の手間」と「確認の手間」を極限までゼロにする**ことを目指した、小規模事業者向けの管理台帳ポータル（PoC/デモ）です。

国の調達ポータル（オープンデータ）を「自社の受注」と見立て、データが自動で集まり、台帳が勝手に出来上がる「Zero-Touch Integration」の世界観を再現しています。

## 🚀 Key Features

### 1. Zero-Touch Integration (完全自動インポート)
手入力は一切不要です。毎朝9時に実行されるデータパイプラインが、外部データソース（調達ポータル等）から最新の受注情報を取得・整形し、ダッシュボードに反映させます。
- **Benefit**: 月間約20時間の作業削減、入力ミス率 0%

### 2. AI Risk Manager (AIリスク管理官)
「この取引のリスクは？」「支払条件は？」といった質問に対し、RAG (Retrieval-Augmented Generation) 技術を用いて、契約書や社内ルール（PDF）を根拠に即答します。
- **Benefit**: 契約書を探す手間がゼロに。判断の根拠（引用元）がその場で分かります。

### 3. Action-Oriented Reports (週次レポート)
「月曜朝の憂鬱」を解消します。今の状況を分析するだけでなく、「いま、あなたが押すべきボタン（督促メール送信など）」を具体的に提案するレポートをワンクリックで生成します。

## 🛠 Tech Stack

このアプリケーションは、**"Input-less" Architecture**（サーバーレスかつ低コストな静的配信構成）を採用しています。

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [shadcn/ui](https://ui.shadcn.com/)
- **Database (OLAP)**: [DuckDB](https://duckdb.org/) (Data Warehouse)
- **Transformation**: [dbt](https://www.getdbt.com/) (Data Build Tool, Bronze/Silver/Gold layers)
- **Pipeline**: Python, GitHub Actions (Daily ETL)
- **Deployment**: Vercel

### Architecture Flow
1.  **Extract**: GitHub Actionsが調達ポータルからデータを取得
2.  **Load**: DuckDB (`warehouse.duckdb`) にロード・重複排除
3.  **Transform**: dbtで正規化・データ整形・KPI計算
4.  **Export**: GoldデータをJSONとしてエクスポート
5.  **Deploy**: Vercelが最新のJSONを含むアプリを自動デプロイ

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/fostex0329/close-the-loop-ledger.git
   cd close-the-loop-ledger
   ```

2. **Setup Frontend**
   ```bash
   cd web
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **(Optional) Run Data Pipeline**
   ```bash
   # Setup Python venv
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

   # Run ETL scripts
   python pipelines/update_warehouse.py  # Load data
   dbt run                               # Transform
   python pipelines/export_json.py       # Export for frontend
   ```

## 📊 Data Sources

本デモでは、以下のオープンデータを利用しています。
- **調達ポータル（内閣官房）**: 落札実績データ
- **国税庁 法人番号公表サイト**: 法人基本3情報（名寄せ・住所付与）

※ デモ画面に表示されるデータは、上記オープンデータを加工したものであり、実在の取引を表すものではありません。PDF文書等はデモ用に生成された架空のものです。

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
