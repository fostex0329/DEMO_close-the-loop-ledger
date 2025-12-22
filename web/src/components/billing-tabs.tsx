'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { InvoicesTable } from '@/components/invoices-table';
import { PaymentsTable } from '@/components/payments-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceRow, PaymentRow, PaginatedResult } from '@/lib/data';

interface BillingTabsProps {
  invoicesData: PaginatedResult<InvoiceRow>;
  paymentsData: PaginatedResult<PaymentRow>;
}

export function BillingTabs({ invoicesData, paymentsData }: BillingTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleInvoicePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('invoicePage', page.toString());
    router.push(`/billing?${params.toString()}`);
  };
  
  const handlePaymentPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('paymentPage', page.toString());
    router.push(`/billing?${params.toString()}`);
  };

  return (
    <Tabs defaultValue="invoices" className="space-y-4">
      <TabsList>
        <TabsTrigger value="invoices">請求書 ({invoicesData.total.toLocaleString()}件)</TabsTrigger>
        <TabsTrigger value="payments">入金 ({paymentsData.total.toLocaleString()}件)</TabsTrigger>
      </TabsList>
      <TabsContent value="invoices" className="space-y-4">
        <InvoicesTable 
          initialData={invoicesData} 
          onPageChange={handleInvoicePageChange}
        />
      </TabsContent>
      <TabsContent value="payments" className="space-y-4">
        <PaymentsTable 
          initialData={paymentsData}
          onPageChange={handlePaymentPageChange}
        />
      </TabsContent>
    </Tabs>
  );
}
