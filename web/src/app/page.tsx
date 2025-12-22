import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getKPIs, getOrders, getExceptions } from "@/lib/data";
import Link from "next/link";

export default async function DashboardPage() {
  const kpis = await getKPIs();
  const exceptions = await getExceptions();
  // Sort exceptions by severity (CRITICAL > HIGH > MEDIUM > LOW)
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const recentExceptions = [...exceptions]
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);

  const recentOrders = (await getOrders()).slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-white">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">今月の概況と要対応項目</p>
        </div>
      </header>

      <main className="px-6 py-8">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総受注件数</CardTitle>
              <Badge variant="secondary">合計</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalOrders} 件</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総受注額</CardTitle>
              <Badge variant="secondary">金額</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未請求額</CardTitle>
              <Badge variant="outline">未請求</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.unbilledAmount)}</div>
              <p className="text-xs text-muted-foreground">請求待ち</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">期限超過額</CardTitle>
              <Badge variant="destructive">要対応</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.overdueAmount)}</div>
              <p className="text-xs text-muted-foreground">対応が必要です</p>
            </CardContent>
          </Card>
        </div>

        {/* Exceptions Alert Section */}
        {recentExceptions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">要対応のアラート ({exceptions.length}件)</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentExceptions.map((ex) => (
                <Card key={ex.order_id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-medium">{ex.exception_type}</CardTitle>
                      <Badge variant={ex.severity === 'CRITICAL' || ex.severity === 'HIGH' ? 'destructive' : 'outline'}>
                        {ex.severity}
                      </Badge>
                    </div>
                    <CardDescription>{ex.organization_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{ex.exception_description}</p>
                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                      <span>{ex.procurement_name}</span>
                      <span>{formatCurrency(ex.amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/reports" className="text-sm text-primary hover:underline">
                すべてのアラートを表示 &rarr;
              </Link>
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>最新の受注状況</CardTitle>
            <CardDescription>直近5件のオーダーを表示しています</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link key={order.sequence_no} href={`/orders/${order.sequence_no}`} className="block">
                  <div className="flex items-center justify-between border-b pb-3 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 -mx-2 px-2 rounded-md transition-colors">
                    <div>
                      <p className="font-medium text-primary">{order.organization_name}</p>
                      <p className="text-sm text-muted-foreground">{order.procurement_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <Badge variant={order.billing_status === 'UNBILLED' ? 'outline' : 'default'}>
                        {order.billing_status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
