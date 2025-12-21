-- gold_exceptions.sql
-- Detects and categorizes exceptions:
-- 1. UNBILLED: Orders not yet invoiced (no invoice after X days)
-- 2. OVERDUE: Invoices past payment due date with no/partial payment
-- 3. AMOUNT_MISMATCH: Payment amount differs from invoice amount

{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('int_orders_enriched') }}
),

invoices as (
    select * from {{ ref('gold_invoices') }}
),

payments as (
    select * from {{ ref('gold_payments') }}
),

-- Exception Type 1: UNBILLED (orders without invoices after 7 days)
unbilled as (
    select
        o.sequence_no as order_id,
        o.organization_name,
        o.procurement_name,
        o.contractor_name,
        o.contract_amount as amount,
        o.contract_date as order_date,
        'UNBILLED' as exception_type,
        '受注から7日以上経過しているが未請求' as exception_description,
        (current_date - o.contract_date::date) as days_since_order,
        null::date as due_date,
        null as days_overdue,
        'HIGH' as severity,
        current_date as detected_date
    from orders o
    left join invoices i on o.sequence_no = i.order_id
    where i.actual_invoice_date is null
      and o.contract_date is not null
      and (current_date - o.contract_date::date) > 7
),

-- Exception Type 2: OVERDUE (invoices past due date, not fully paid)
overdue as (
    select
        i.order_id,
        i.organization_name,
        o.procurement_name,
        i.contractor_name,
        i.invoice_amount as amount,
        o.contract_date as order_date,
        'OVERDUE' as exception_type,
        '支払期日を超過（未入金または部分入金）' as exception_description,
        null as days_since_order,
        i.payment_due_date as due_date,
        (current_date - i.payment_due_date) as days_overdue,
        case 
            when (current_date - i.payment_due_date) > 14 then 'CRITICAL'
            when (current_date - i.payment_due_date) > 7 then 'HIGH'
            else 'MEDIUM'
        end as severity,
        current_date as detected_date
    from invoices i
    left join payments p on i.invoice_number = p.invoice_number
    left join orders o on i.order_id = o.sequence_no
    where i.actual_invoice_date is not null  -- must be invoiced
      and i.payment_due_date < current_date  -- past due
      and (p.payment_date is null or p.payment_amount < i.invoice_amount)  -- not fully paid
),

-- Exception Type 3: AMOUNT_MISMATCH (payment differs from invoice by > 1%)
amount_mismatch as (
    select
        i.order_id,
        i.organization_name,
        o.procurement_name,
        i.contractor_name,
        i.invoice_amount as amount,
        o.contract_date as order_date,
        'AMOUNT_MISMATCH' as exception_type,
        '入金額と請求額が一致しない（差異: ' || cast(abs(p.payment_amount - i.invoice_amount) as varchar) || '円）' as exception_description,
        null as days_since_order,
        i.payment_due_date as due_date,
        null as days_overdue,
        'MEDIUM' as severity,
        current_date as detected_date
    from invoices i
    inner join payments p on i.invoice_number = p.invoice_number
    left join orders o on i.order_id = o.sequence_no
    where p.payment_amount is not null
      and abs(p.payment_amount - i.invoice_amount) > (i.invoice_amount * 0.01)  -- > 1% difference
)

-- Combine all exceptions
select * from unbilled
union all
select * from overdue
union all
select * from amount_mismatch
