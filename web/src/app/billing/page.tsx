import { Suspense } from 'react';
import { getInvoices, getPayments } from '@/lib/data';
import { InvoicesTable } from '@/components/invoices-table';
import { PaymentsTable } from '@/components/payments-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function BillingPage() {
  const invoices = await getInvoices();
  const payments = await getPayments();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track payments across all projects.
          </p>
        </div>
        <div className="flex gap-2">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Register Payment
            </Button>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="space-y-4">
          <Suspense fallback={<div>Loading invoices...</div>}>
            <InvoicesTable invoices={invoices} />
          </Suspense>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Suspense fallback={<div>Loading payments...</div>}>
            <PaymentsTable payments={payments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
