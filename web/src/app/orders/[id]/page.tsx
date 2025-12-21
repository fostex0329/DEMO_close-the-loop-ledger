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
import { getOrderById, getInvoicesByOrderId, getPaymentsByOrderId } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = parseInt(id);
  
  if (isNaN(orderId)) {
    notFound();
  }

  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }

  const invoices = await getInvoicesByOrderId(orderId);
  const payments = await getPaymentsByOrderId(orderId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OVERDUE': return 'destructive';
      case 'UNBILLED': return 'outline';
      case 'PAID': return 'default';
      default: return 'secondary';
    }
  };

  const simulatedSQL = `
-- Source: dbt/models/gold/gold_ledger.sql
SELECT 
    b.sequence_no,
    b.organization_name,
    b.procurement_name,
    c.corporate_name,
    b.contract_amount,
    b.contract_date
FROM bronze_bids b
LEFT JOIN bronze_corporate c 
    ON b.corporate_number = c.corporate_number
WHERE b.sequence_no = ${orderId};
  `.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Order #{orderId}</h1>
            <Badge variant={getStatusVariant(order.billing_status)} className="ml-2">
              {order.billing_status}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Top Section: Info & Evidence */}
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>案件情報</CardTitle>
              <CardDescription>Bronze/Silver層からの基本情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">発注機関</span>
                  <span className="font-medium">{order.organization_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">契約日</span>
                  <span className="font-medium">{order.contract_date}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">件名</span>
                  <span className="font-medium">{order.procurement_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">受注者</span>
                  <span className="font-medium">{order.contractor_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">金額</span>
                  <span className="font-medium text-lg">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence / Lineage */}
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>根拠データ (Lineage)</span>
                <Badge variant="outline" className="font-mono text-xs">dbt generated</Badge>
              </CardTitle>
              <CardDescription>このレコードを生成した処理ロジック (Simulated)</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto font-mono">
                {simulatedSQL}
              </pre>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Source Table: <span className="font-mono">main_gold.gold_ledger</span></p>
                <p>Pipeline Run: <span className="font-mono">2025-12-21 09:00:00 JST</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Billing & Payment History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">請求・入金履歴</h2>
          
          {invoices.length === 0 ? (
             <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground">
               まだ請求データがありません (Unbilled)
             </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Date / Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Invoices */}
                  {invoices.map((inv) => (
                    <TableRow key={inv.invoice_number}>
                      <TableCell><Badge variant="outline">Invoice</Badge></TableCell>
                      <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Issued: {inv.invoice_date}</div>
                          <div className="text-muted-foreground text-xs">Due: {inv.payment_due_date}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.invoice_amount)}</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Payments */}
                  {payments.map((pmt) => (
                    <TableRow key={String(pmt.item_id || pmt.invoice_number + 'pmt')}>
                      <TableCell><Badge variant="secondary">Payment</Badge></TableCell>
                      <TableCell className="text-muted-foreground">For {pmt.invoice_number}</TableCell>
                      <TableCell>{pmt.payment_date || 'Pending'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(pmt.payment_amount)}</TableCell>
                      <TableCell>
                         <Badge variant={pmt.payment_status === 'PAID' ? 'default' : 'destructive'}>
                           {pmt.payment_status}
                         </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
