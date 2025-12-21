"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InvoiceRow } from "@/lib/data";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      invoice.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>請求書一覧</CardTitle>
        <CardDescription>
          全ての請求書を確認・管理できます。
        </CardDescription>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="発注機関または請求番号で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>請求番号</TableHead>
                <TableHead>発注機関</TableHead>
                <TableHead>発行日</TableHead>
                <TableHead>支払期限</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    請求書が見つかりません。
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.invoice_number}>
                    <TableCell className="font-medium">
                      <Link href={`/orders/${inv.order_id}`} className="hover:underline text-primary">
                        {inv.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.organization_name}</TableCell>
                    <TableCell>{inv.invoice_date.split(' ')[0]}</TableCell>
                    <TableCell>{inv.payment_due_date.split(' ')[0]}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.invoice_amount)}</TableCell>
                    <TableCell>
                         {/* TODO: Add proper status logic if available in invoice row, or join with payment info */}
                         <Badge variant="outline">発行済</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
