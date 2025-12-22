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
import { PaymentRow, PaginatedResult } from "@/lib/data";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaymentsTableProps {
  initialData: PaginatedResult<PaymentRow>;
  onPageChange: (page: number) => void;
}

export function PaymentsTable({ initialData, onPageChange }: PaymentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: payments, page, totalPages, total } = initialData;

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    return (
      payment.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  // Generate page numbers for pagination display
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>入金一覧</CardTitle>
        <CardDescription>
          全{total.toLocaleString()}件の入金情報（{page}ページ目 / {totalPages}ページ）
        </CardDescription>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="請求番号で検索..."
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
                <TableHead>入金日</TableHead>
                <TableHead>支払期限</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    入金情報が見つかりません。
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((pmt, index) => (
                  <TableRow key={`${pmt.invoice_number}-${index}`}>
                    <TableCell className="font-medium">
                        <Link href={`/orders/${pmt.order_id}`} className="hover:underline text-primary">
                            {pmt.invoice_number}
                        </Link>
                    </TableCell>
                    <TableCell>{pmt.payment_date?.split(' ')[0] || '-'}</TableCell>
                    <TableCell>{pmt.payment_due_date?.split(' ')[0]}</TableCell>
                    <TableCell className="text-right">{formatCurrency(pmt.payment_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={pmt.payment_status === 'PAID' ? 'default' : 'destructive'}>
                        {pmt.payment_status === 'PAID' ? '入金済' : pmt.payment_status === 'PAID_LATE' ? '遅延入金' : '未入金'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getVisiblePages().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); onPageChange(pageNum); }}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
