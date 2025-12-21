with orders as (
    select * from {{ ref('int_orders_enriched') }}
),

invoices_agg as (
    select 
        order_id, 
        sum(invoice_amount) as total_invoiced
    from {{ ref('gold_invoices') }} 
    group by order_id
),

payments_agg as (
    select 
        order_id, 
        sum(payment_amount) as total_paid
    from {{ ref('gold_payments') }} 
    group by order_id
),

overdue_orders as (
    select distinct order_id 
    from {{ ref('gold_exceptions') }} 
    where exception_type = 'OVERDUE'
)

select 
    o.*,
    cast(o.contract_amount as double) as amount,
    o.contract_date as order_date,
    case 
        when coalesce(p.total_paid, 0) >= cast(o.contract_amount as double) and cast(o.contract_amount as double) > 0 then 'PAID'
        when ov.order_id is not null then 'OVERDUE'
        when coalesce(i.total_invoiced, 0) > 0 then 'BILLED'
        else 'UNBILLED'
    end as billing_status
from orders o
left join invoices_agg i on o.sequence_no = i.order_id
left join payments_agg p on o.sequence_no = p.order_id
left join overdue_orders ov on o.sequence_no = ov.order_id
