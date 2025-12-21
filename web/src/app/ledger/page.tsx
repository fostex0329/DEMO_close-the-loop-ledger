import { getOrders } from "@/lib/data";
import Link from "next/link";
import { LedgerTable } from "@/components/ledger-table";

export default async function LedgerPage() {
  const orders = await getOrders();

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
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">ダッシュボード</Link>
              <Link href="/ledger" className="text-sm font-medium text-primary">受注台帳</Link>
              <Link href="/billing" className="text-sm font-medium text-muted-foreground hover:text-primary">請求・入金</Link>
              <Link href="/reports" className="text-sm font-medium text-muted-foreground hover:text-primary">週次レポート</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <LedgerTable orders={orders} />
      </main>
    </div>
  );
}
