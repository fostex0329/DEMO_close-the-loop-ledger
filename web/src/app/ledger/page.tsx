import { getOrders } from "@/lib/data";
import { LedgerTable } from "@/components/ledger-table";

export default async function LedgerPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-white">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">受注台帳</h1>
          <p className="text-sm text-muted-foreground">全案件の一覧と詳細</p>
        </div>
      </header>

      <main className="px-6 py-8">
        <LedgerTable orders={orders} />
      </main>
    </div>
  );
}
