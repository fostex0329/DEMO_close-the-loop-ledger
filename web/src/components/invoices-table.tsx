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
import { InvoiceRow, PaginatedResult } from "@/lib/data";
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

interface InvoicesTableProps {
  initialData: PaginatedResult<InvoiceRow>;
  onPageChange: (page: number) => void;
}

export function InvoicesTable({ initialData, onPageChange }: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: invoices, page, totalPages, total } = initialData;

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    return (
      invoice.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <CardTitle>請求書一覧</CardTitle>
        <CardDescription>
          全{total.toLocaleString()}件の請求書（{page}ページ目 / {totalPages}ページ）
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
                filteredInvoices.map((inv, index) => (
                  <TableRow key={`${inv.invoice_number}-${index}`}>
                    <TableCell className="font-medium">
                      <Link href={`/orders/${inv.order_id}`} className="hover:underline text-primary">
                        {inv.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.organization_name}</TableCell>
                    <TableCell>{inv.invoice_date?.split(' ')[0]}</TableCell>
                    <TableCell>{inv.payment_due_date?.split(' ')[0]}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.invoice_amount)}</TableCell>
                    <TableCell>
                         <Badge variant="outline">発行済</Badge>
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
