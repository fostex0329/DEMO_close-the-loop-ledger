-- gold_payments.sql
-- Generates demo payment data from invoices
-- In production, this would come from bank statements or accounting system

{{ config(materialized='table') }}

with invoices as (
    select * from {{ ref('gold_invoices') }}
),

-- Generate demo payments: some paid on time, some late, some not paid
payments as (
    select
        invoice_number,
        order_id,
        invoice_amount,
        payment_due_date,
        -- Demo payment logic:
        -- sequence_no % 5 = 0: not paid (null)
        -- sequence_no % 5 = 1: paid late (7 days after due)
        -- others: paid on time (3 days before due)
        case 
            when order_id % 5 = 0 then null  -- 20% not paid
            when order_id % 5 = 1 then (payment_due_date + interval '7 days')::date  -- 20% paid late
            else (payment_due_date - interval '3 days')::date  -- 60% paid on time
        end as payment_date,
        case 
            when order_id % 5 = 0 then 0  -- not paid
            when order_id % 5 = 1 then invoice_amount  -- paid late but full
            else invoice_amount  -- paid on time
        end as payment_amount,
        case 
            when order_id % 5 = 0 then 'UNPAID'
            when order_id % 5 = 1 then 'PAID_LATE'
            else 'PAID'
        end as payment_status,
        current_date as snapshot_date
    from invoices
    where actual_invoice_date is not null  -- only invoiced orders can have payments
)

select * from payments
