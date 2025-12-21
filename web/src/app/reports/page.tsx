import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getKPIs, getExceptions } from "@/lib/data";
import Link from "next/link";

export default async function ReportsPage() {
  const kpis = await getKPIs();
  const exceptions = await getExceptions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  const today = new Date().toISOString().split('T')[0];

  // Determine health status
  let health = '🟢 正常';
  let healthVariant: 'default' | 'outline' | 'destructive' = 'default';
  if (kpis.overdueAmount > 0) {
    health = '🔴 要注意 (期限超過あり)';
    healthVariant = 'destructive';
  } else if (kpis.unbilledAmount > 0) {
    health = '🟡 注意 (未請求あり)';
    healthVariant = 'outline';
  }

  // Sort exceptions by urgency
  const sortedExceptions = [...exceptions].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Close the Loop Ledger</h1>
              <p className="text-sm text-muted-foreground">受注〜請求〜入金 管理ダッシュボード</p>
            </div>
            <nav className="flex gap-4">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">Dashboard</Link>
              <Link href="/ledger" className="text-sm font-medium text-muted-foreground hover:text-primary">Ledger</Link>
              <Link href="/reports" className="text-sm font-medium text-primary">Reports</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>週次ステータスレポート</CardTitle>
            <CardDescription>{today} 時点のサマリ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health Status */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">全体ステータス:</span>
              <Badge variant={healthVariant}>{health}</Badge>
            </div>

            <Separator />

            {/* Summary Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1. サマリ</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">未回収額:</span>{' '}
                  {formatCurrency(kpis.unbilledAmount + kpis.overdueAmount)}{' '}
                  <span className="text-muted-foreground">
                    (内、期限超過: {formatCurrency(kpis.overdueAmount)})
                  </span>
                </li>
                <li>
                  <span className="font-medium">アクション:</span>{' '}
                  <span className="text-orange-600 dark:text-orange-400">
                    {exceptions.length} 件の対応が必要です
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            {/* Action Items using Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">2. 要対応リスト</h3>
              {sortedExceptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">対応が必要な案件はありません。</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ステータス</TableHead>
                        <TableHead>重要度</TableHead>
                        <TableHead>案件名 / 詳細</TableHead>
                        <TableHead className="text-right">金額</TableHead>
                        <TableHead>期日 / 経過</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedExceptions.map((ex) => (
                        <TableRow key={ex.order_id}>
                          <TableCell>
                            <Badge variant="outline">{ex.exception_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={ex.severity === 'CRITICAL' || ex.severity === 'HIGH' ? 'destructive' : 'secondary'}
                            >
                              {ex.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <Link href={`/orders/${ex.order_id}`} className="hover:underline text-primary block">
                                <span className="font-medium">{ex.organization_name}</span>
                              </Link>
                              <span className="text-xs text-muted-foreground">{ex.procurement_name}</span>
                              <span className="text-xs text-orange-600">{ex.exception_description}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(ex.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ex.due_date ? `期日: ${ex.due_date}` : `受注から ${ex.days_since_order}日`}
                            {ex.days_overdue && <span className="block text-red-600">{ex.days_overdue}日超過</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground">
              このレポートをコピーしてSlack/Chatworkに貼り付けてください。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
