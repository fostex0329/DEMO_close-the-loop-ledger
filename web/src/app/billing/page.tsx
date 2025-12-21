import { Suspense } from 'react';
import { getInvoices, getPayments } from '@/lib/data';
import { InvoicesTable } from '@/components/invoices-table';
import { PaymentsTable } from '@/components/payments-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentModal } from "@/components/payment-modal";

export default async function BillingPage() {
  const invoices = await getInvoices();
  const payments = await getPayments();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-3xl font-bold tracking-tight">請求・入金管理</h1>
          <p className="text-muted-foreground">
            全プロジェクトの請求書と入金を管理します。
          </p>
        </div>
        <div className="flex gap-2">
            <PaymentModal invoices={invoices.map(inv => ({ 
              invoice_number: inv.invoice_number,
              project_name: inv.organization_name, // Using organization name as proxy for project context
              amount: inv.invoice_amount 
            }))} />
        </div>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">請求書 ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">入金 ({payments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="space-y-4">
          <Suspense fallback={<div>請求書を読み込み中...</div>}>
            <InvoicesTable invoices={invoices} />
          </Suspense>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Suspense fallback={<div>入金情報を読み込み中...</div>}>
            <PaymentsTable payments={payments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
