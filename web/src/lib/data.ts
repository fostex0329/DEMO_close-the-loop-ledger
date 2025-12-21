// This file should only be used in server components
import ordersData from './orders.json';
import exceptionsData from './exceptions.json';
import invoicesData from './invoices.json';
import paymentsData from './payments.json';

export interface OrderRow {
  sequence_no: string;
  organization_name: string;
  procurement_name: string;
  contract_date: string;
  contractor_name: string;
  contract_amount: number;
  corporate_number: string | number;
  corporate_name: string | null;
  address_prefecture: string | null;
  address_city: string | null;
  billing_status: string;
  amount: number;
  order_date: string;
}

export interface ExceptionRow {
  order_id: string;
  organization_name: string;
  procurement_name: string;
  contractor_name: string;
  amount: number;
  order_date: string;
  exception_type: 'UNBILLED' | 'OVERDUE' | 'AMOUNT_MISMATCH';
  exception_description: string;
  days_since_order: number | null;
  due_date: string | null;
  days_overdue: number | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detected_date: string;
}

export interface InvoiceRow {
  order_id: string;
  invoice_number: string;
  organization_name: string;
  contractor_name: string;
  invoice_amount: number;
  invoice_date: string;
  payment_due_date: string;
  actual_invoice_date: string | null;
  currency: string;
}

export interface PaymentRow {
  invoice_number: string;
  order_id: string;
  invoice_amount: number;
  payment_due_date: string;
  payment_date: string | null;
  payment_amount: number;
  payment_status: 'PAID' | 'PAID_LATE' | 'UNPAID';
  item_id?: string;
}

export interface KPIs {
  totalOrders: number;
  totalAmount: number;
  unbilledAmount: number;
  overdueAmount: number;
  exceptionCount: number;
}

export async function getOrders(): Promise<OrderRow[]> {
  return ordersData as unknown as OrderRow[];
}

export async function getExceptions(): Promise<ExceptionRow[]> {
  return exceptionsData as unknown as ExceptionRow[];
}

export async function getInvoices(): Promise<InvoiceRow[]> {
  return invoicesData as unknown as InvoiceRow[];
}

export async function getPayments(): Promise<PaymentRow[]> {
  return paymentsData as unknown as PaymentRow[];
}

export async function getKPIs(): Promise<KPIs> {
  const orders = await getOrders();
  const exceptions = await getExceptions();
  
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  
  // Calculate from exceptions table for accuracy
  const unbilledAmount = exceptions
    .filter(e => e.exception_type === 'UNBILLED')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const overdueAmount = exceptions
    .filter(e => e.exception_type === 'OVERDUE')
    .reduce((sum, e) => sum + (e.amount || 0), 0);


  return { 
    totalOrders, 
    totalAmount, 
    unbilledAmount, 
    overdueAmount,
    exceptionCount: exceptions.length 
  };
}

export async function getOrderById(id: string): Promise<OrderRow | undefined> {
  const orders = await getOrders();
  // Ensure we compare strings
  return orders.find(o => String(o.sequence_no) === id);
}

export async function getInvoicesByOrderId(orderId: string): Promise<InvoiceRow[]> {
  const invoices = await getInvoices();
  return invoices.filter(i => String(i.order_id) === orderId);
}

export async function getPaymentsByOrderId(orderId: string): Promise<PaymentRow[]> {
  const payments = await getPayments();
  return payments.filter(p => String(p.order_id) === orderId);
}
