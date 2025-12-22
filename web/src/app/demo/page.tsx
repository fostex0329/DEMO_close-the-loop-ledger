import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, FileText, CheckCircle2 } from "lucide-react";

export default function DemoGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-white">
        <div className="px-6 py-4">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">デモガイド</h1>
                <Badge variant="secondary">Demo Mode Only</Badge>
            </div>
          <p className="text-sm text-muted-foreground">このアプリケーションのデモ機能とシナリオの解説</p>
        </div>
      </header>

      <main className="px-6 py-8 space-y-6 max-w-5xl">

        {/* Introduction */}
        <Card>
            <CardHeader>
                <CardTitle>デモモードについて</CardTitle>
                <CardDescription>
                    現在、このアプリケーションは「Demo Mode」で動作しています。<br/>
                    OpenAI APIを使用せず、事前に用意された固定の回答と仮想データを使用して、安全かつ迅速に機能を確認できます。
                </CardDescription>
            </CardHeader>
        </Card>

        {/* Open Data Integration Scenario */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-sky-100 rounded-md">
                    <svg className="h-5 w-5 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <CardTitle>0. 完全自動インポート (Zero-Touch Integration)</CardTitle>
            </div>
            <CardDescription className="text-base">
                このプロダクトの最大の特徴は<strong>「入力の手間がゼロ」</strong>であることです。<br/>
                従来のスプレッドシートやSaaSでは「正しく入力すること」が前提でしたが、本システムでは<strong>データが自動で集まり、台帳が勝手に出来上がります</strong>。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-red-200 rounded-md p-4 bg-red-50/50">
                    <h3 className="font-semibold mb-3 text-sm text-red-900 flex items-center gap-2">
                        <span className="text-red-500">✗</span> 従来の運用
                    </h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                        <li>• 受注のたびにスプレッドシートに手入力</li>
                        <li>• 入力漏れ・入力ミスによる<strong>機会損失（請求漏れ）</strong></li>
                        <li>• 月末に「あの案件どうなった？」と確認が必要</li>
                        <li>• 台帳が陳腐化し、誰も信用しなくなる</li>
                    </ul>
                </div>
                <div className="border border-green-200 rounded-md p-4 bg-green-50/50">
                    <h3 className="font-semibold mb-3 text-sm text-green-900 flex items-center gap-2">
                        <span className="text-green-500">✓</span> このプロダクト
                    </h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                        <li>• <strong>24時間365日 データ取得を自動化</strong></li>
                        <li>• 月間約20時間の作業削減（月50件処理想定）、<strong>手入力によるミスをゼロに</strong></li>
                        <li>• ログインした瞬間、最新の台帳が見える</li>
                        <li>• 「真実の一枚」として監査証跡にも使える</li>
                    </ul>
                </div>
            </div>

            {/* How it works */}
            <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-3 text-sm text-slate-900">🔄 どうやって自動化しているのか</h3>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-slate-100 rounded p-2 flex flex-col justify-center">
                        <div className="font-bold text-slate-700">1. データ収集</div>
                        <div className="text-[10px] text-slate-500 mt-1">API / CSV / Web</div>
                    </div>
                    <div className="flex items-center justify-center text-slate-400">→</div>
                    <div className="bg-slate-100 rounded p-2 flex flex-col justify-center relative group">
                        <div className="font-bold text-slate-700">2. 自動データ整形</div>
                        <div className="text-[10px] text-slate-500 mt-1">名寄せ・クレンジング</div>
                    </div>
                    <div className="flex items-center justify-center text-slate-400">→</div>
                    <div className="bg-sky-100 rounded p-2 flex flex-col justify-center">
                        <div className="font-bold text-sky-700">3. 配信</div>
                        <div className="text-[10px] text-sky-600 mt-1">あなたの画面へ</div>
                    </div>
                </div>
            </div>

            {/* Use Cases */}
            <div className="border rounded-md p-4 bg-slate-50">
                <h3 className="font-semibold mb-3 text-sm text-slate-900">💡 あなたの業務に置き換えると...</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                    <li><strong>制作会社:</strong> クライアントからの発注情報を自動連携 → 案件台帳が自動生成</li>
                    <li><strong>メディア運営:</strong> 広告配信レポートを自動取得 → 請求・売上の突合が自動化</li>
                    <li><strong>ECサイト:</strong> 受注CSVを自動インポート → 出荷・入金管理台帳に反映</li>
                    <li><strong>本デモ:</strong> 国の調達ポータル（オープンデータ）を「自社の受注」と見立てて再現</li>
                </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600 flex items-start gap-2 border">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                    <strong>確認ポイント:</strong> ダッシュボードや受注台帳を見てください。手入力を一切行わずに、最新の案件情報やステータスが既に反映されている状態を体験できます。
                </div>
            </div>

            {/* AI Future Note */}
            <div className="p-4 bg-purple-50 rounded-md text-sm text-purple-900 flex items-start gap-2 border border-purple-200">
                <div className="p-0.5 bg-purple-200 rounded-full mt-0.5">
                    <svg className="w-3 h-3 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <strong>将来の拡張性 (Powered by dbt):</strong><br/>
                    現在はSQLルールベースで整形していますが、パイプラインにLLMを組み込むことで、表記ゆれの自動補正など、さらに高度な「AI整形」へとシームレスに進化可能です。
                </div>
            </div>
          </CardContent>
        </Card>

        {/* RAG Chat Scenario */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>1. AIリサーチアシスタント (RAG Chat)</CardTitle>
            </div>
            <CardDescription className="text-base">
                <span className="text-primary font-semibold">データは自動で集まりました。あなた専属のAIリスク管理官が、全契約書を常時監視しています。</span><br/>
                週次レポートページのチャット機能で、以下の質問を試してみてください。実際のPDFファイル（契約書・発注書・社内ルール）の内容に基づいた回答が返ってきます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">入力キーワード</TableHead>
                        <TableHead className="w-[200px]">質問例</TableHead>
                        <TableHead>AIの返答内容（シナリオ）</TableHead>
                        <TableHead className="text-right">参照PDF</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium"><Badge variant="outline">支払</Badge> + <Badge variant="outline">条件</Badge></TableCell>
                        <TableCell>「支払条件を教えて」</TableCell>
                        <TableCell>月末締め翌月末払い、遅延損害金（年率14.6%）について回答します。</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">基本契約書</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium"><Badge variant="outline">リスク</Badge></TableCell>
                        <TableCell>「この取引にリスクはある？」</TableCell>
                        <TableCell>遅延損害金（14.6%）が相場より高いリスクを検知しました。</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">基本契約書</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium"><Badge variant="outline">督促</Badge></TableCell>
                        <TableCell>「督促フローは？」</TableCell>
                        <TableCell>1営業日後（メール）→7日後（電話）→14日後（停止判断）のエスカレーションルールを回答します。</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">社内ルール</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm text-slate-600 flex items-start gap-2 border">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                    <strong>確認ポイント:</strong> 返答に含まれる「引用元」リンクをクリックすると、実際に根拠となったPDFファイル（マスキング済みデモデータ）が開きます。
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Generator Scenario */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>2. 週次レポート生成</CardTitle>
            </div>
            <CardDescription className="text-base">
                <span className="text-primary font-semibold">個別の確認が終わったら、最後に全体の状況をまとめて報告書を作成します。</span><br/>
                <span className="text-muted-foreground text-xs">「月曜朝の憂鬱」を解消しましょう。</span><br/>
                週次レポートページの「レポートを生成」ボタンをクリックすると、現在のダッシュボード状況を分析したレポートが生成されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2 text-sm text-slate-900">生成されるシナリオ</h3>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li><strong>ステータス:</strong> 概ね順調だが期限超過が2件あり</li>
                        <li><strong>アクション:</strong> 督促メールの送信と単価交渉の準備を提案</li>
                        <li><strong>Next Action:</strong> <strong>「いま、あなたが押すべきボタンはこれです」</strong>と具体的に示唆</li>
                    </ul>
                </div>
                <div className="border rounded-md p-4 bg-slate-50 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground text-center">
                        生成には約2秒かかります<br/>
                        （AIの思考時間をシミュレート）
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
