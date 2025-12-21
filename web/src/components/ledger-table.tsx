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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderRow } from "@/lib/data";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LedgerTable({ orders }: { orders: OrderRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.procurement_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "ALL" || order.billing_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>受注台帳 (Order Ledger)</CardTitle>
        <CardDescription>
          検索とフィルタリングが可能です ({filteredOrders.length} 件)
        </CardDescription>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="発注機関または案件名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="UNBILLED">UNBILLED</SelectItem>
              <SelectItem value="OVERDUE">OVERDUE</SelectItem>
              <SelectItem value="PAID">PAID</SelectItem>
              <SelectItem value="INVALID">INVALID</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>発注機関</TableHead>
                <TableHead>案件名</TableHead>
                <TableHead>受注者</TableHead>
                <TableHead>契約日</TableHead>
                <TableHead className="text-right">契約金額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.sequence_no}>
                    <TableCell className="font-medium">{order.sequence_no}</TableCell>
                    <TableCell>{order.organization_name}</TableCell>
                    <TableCell>
                      <Link href={`/orders/${order.sequence_no}`} className="hover:underline text-primary">
                        <div className="max-w-[200px] truncate" title={order.procurement_name}>
                          {order.procurement_name}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>{order.contractor_name}</TableCell>
                    <TableCell>{order.contract_date}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.billing_status === "OVERDUE"
                            ? "destructive"
                            : order.billing_status === "UNBILLED"
                            ? "outline"
                            : "default"
                        }
                      >
                        {order.billing_status}
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
