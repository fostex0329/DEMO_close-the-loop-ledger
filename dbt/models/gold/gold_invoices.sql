-- gold_invoices.sql
-- Generates demo invoice data from orders
-- In production, this would come from an actual invoicing system

{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('int_orders_enriched') }}
),

-- Generate demo invoices for orders with contract_date
invoices as (
    select
        sequence_no as order_id,
        'INV-' || strftime(contract_date::date, '%Y%m') || '-' || lpad(cast(sequence_no as varchar), 4, '0') as invoice_number,
        organization_name,
        contractor_name,
        contract_amount as invoice_amount,
        -- Invoice date: 5 business days after contract date
        (contract_date::date + interval '5 days')::date as invoice_date,
        -- Payment due: 30 days after invoice date (Net 30)
        (contract_date::date + interval '35 days')::date as payment_due_date,
        -- Demo: randomly mark some as invoiced, some not
        case 
            when hash(sequence_no) % 3 = 0 then null  -- 1/3 are not yet invoiced
            else (contract_date::date + interval '5 days')::date
        end as actual_invoice_date,
        'JPY' as currency,
        current_date as snapshot_date
    from orders
    where contract_date is not null
)

select * from invoices
