import { Suspense } from 'react';
import { getInvoicesPaginated, getPaymentsPaginated, getInvoices } from '@/lib/data';
import { BillingTabs } from '@/components/billing-tabs';
import { PaymentModal } from "@/components/payment-modal";

interface BillingPageProps {
  searchParams: Promise<{ invoicePage?: string; paymentPage?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const invoicePage = parseInt(params?.invoicePage || '1', 10);
  const paymentPage = parseInt(params?.paymentPage || '1', 10);
  
  // Fetch paginated data
  const [invoicesResult, paymentsResult, allInvoicesForModal] = await Promise.all([
    getInvoicesPaginated(invoicePage, 50),
    getPaymentsPaginated(paymentPage, 50),
    getInvoices().then(invoices => invoices.slice(0, 100)) // Only first 100 for modal dropdown
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-white">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">請求・入金管理</h1>
            <p className="text-sm text-muted-foreground">全プロジェクトの請求書と入金を管理</p>
          </div>
          <div className="flex gap-2">
            <PaymentModal invoices={allInvoicesForModal.map(inv => ({ 
              invoice_number: inv.invoice_number,
              project_name: inv.organization_name,
              amount: inv.invoice_amount 
            }))} />
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-4">
        <Suspense fallback={<div>読み込み中...</div>}>
          <BillingTabs 
            invoicesData={invoicesResult}
            paymentsData={paymentsResult}
          />
        </Suspense>
      </main>
    </div>
  );
}
