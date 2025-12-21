# Close the Loop Ledger - 引き継ぎ書 (Handover Document)

**最終更新日**: 2025-12-21
**ステータス**: フェーズ11完了（請求・入金管理画面実装済み）

---

## 1. プロジェクト概要

『締めの不安を、週1回の確認だけで済む状態にする』をミッションとした、受発注・請求・入金管理アプリケーションです。
**Mini Lakehouseアーキテクチャ**を採用し、DuckDB + dbt でデータを加工、Next.js で可視化しています。

### 技術スタック
- **Data**: DuckDB, dbt (Bronze/Silver/Gold Layer)
- **Backend API**: なし（`export_to_json.py` によるStatic JSON連携）
- **Frontend**: Next.js (App Router), shadcn/ui, Tailwind CSS
- **Infrastructure**: GitHub Actions (日次自動更新 - ワークフロー実装済)

---

## 2. 実装済み機能

| 機能 | 画面/パス | 状態 | 備考 |
|---|---|---|---|
| **Dashboard** | `/` (Home) | ✅ | KPIカード（受注額/未請求）、アラート |
| **Ledger** | `/ledger` | ✅ | 受注台帳、検索・フィルタ、**動的ステータス** (PAID/BILLED/OVERDUE) |
| **Reports** | `/reports` | ✅ | 週次レポート、アクションアイテム |
| **Billing** | `/billing` | ✅ | **[Phase 11 新機能]** 請求・入金一覧、クロスプロジェクト管理 |
| **Details** | `/orders/[id]` | ✅ | 詳細表示、SQLリネージ（根拠データ）表示 |

**※重要なロジック**:
`dbt/models/gold/gold_ledger.sql` にて、請求・入金・例外テーブルを結合し、動的に `billing_status` を計算しています。

---

## 3. 環境構築・開発手順

### Python環境 (データパイプライン & dbt)
プロジェクトルートで実行：
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### データの更新 (ETL実行)
**重要**: Next.js は `warehouse.duckdb` を直接読み込めないため、dbt実行後に必ずJSONエクスポートが必要です。
```bash
# 1. dbtでデータモデル更新
dbt run --project-dir dbt --profiles-dir dbt

# 2. フロントエンド用データのエクスポート
python export_to_json.py
```

### フロントエンド (Next.js)
```bash
cd web
pnpm install
pnpm dev
# http://localhost:3000 にアクセス
```

---

## 4. 残タスク・次のステップ

### 次優先 (High Priority)
1.  **UI機能の完成度向上 (Polish)**:
    *   `/billing` 画面の "Register Payment" ボタンは現在Mock（機能なし）です。モーダル等で実装が必要です（データ書き込みはAPIが必要か、運用フロー検討）。
2.  **検証 (Verification)**:
    *   エンドツーエンドのシナリオテスト

### 今後の拡張 (Future)
*   **dbt Testsの拡充**: 例外検知ロジックの品質担保
*   **例外検知アラートの改善**: 現状は `gold_exceptions` を単純表示。より詳細な条件分岐など。

## 5. 既知の注意点 (Troubleshooting)

*   **DuckDB Lock**: `pnpm dev` や `dbt` を同時実行しても基本大丈夫ですが、稀にロックされる可能性があります。
*   **dbt Configuration**: `dbt/profiles.yml` と `sources.yml` はプロジェクトルートからの実行を前提にパス設定されています（`data/raw/...`, `warehouse.duckdb`）。`dbt` ディレクトリ内から実行する場合はパス解決に注意してください。

以上
