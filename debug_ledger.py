import duckdb

con = duckdb.connect('warehouse.duckdb')

print("--- Tables ---")
tables = con.execute("SHOW TABLES").fetchall()
for t in tables:
    print(t)

# orders = con.execute("SELECT sequence_no, contract_amount FROM main_int.int_orders_enriched").fetchall()

print("\n--- Check gold_invoices ---")
invoices = con.execute("SELECT order_id, invoice_amount FROM main_gold.gold_invoices").fetchall()
print(invoices)

print("\n--- Check Join Logic ---")
query = """
with orders as (
    select * from main_silver.int_orders_enriched
),
invoices_agg as (
    select 
        order_id, 
        sum(invoice_amount) as total_invoiced
    from main_gold.gold_invoices 
    group by order_id
)
select 
    o.sequence_no, 
    o.contract_amount, 
    i.total_invoiced,
    case 
        when i.total_invoiced > 0 then 'BILLED' 
        else 'UNBILLED'
    end as status_test
from orders o
left join invoices_agg i on o.sequence_no = i.order_id
"""
result = con.execute(query).fetchall()
print(result)

print("\n--- Check Actual gold_ledger ---")
ledger = con.execute("SELECT sequence_no, billing_status FROM main_gold.gold_ledger").fetchall()
print(ledger)
