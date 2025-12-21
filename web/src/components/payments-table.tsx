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
import { PaymentRow } from "@/lib/data";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments.filter((payment) => {
    return (
      payment.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>
          Track all received payments.
        </CardDescription>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="Search by Invoice No..."
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
                <TableHead>Invoice No.</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((pmt, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                        <Link href={`/orders/${pmt.order_id}`} className="hover:underline text-primary">
                            {pmt.invoice_number}
                        </Link>
                    </TableCell>
                    <TableCell>{pmt.payment_date?.split(' ')[0] || '-'}</TableCell>
                    <TableCell>{pmt.payment_due_date.split(' ')[0]}</TableCell>
                    <TableCell className="text-right">{formatCurrency(pmt.payment_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={pmt.payment_status === 'PAID' ? 'default' : 'destructive'}>
                        {pmt.payment_status}
                      </Badge>
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
