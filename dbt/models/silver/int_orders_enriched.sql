with bids as (
    select * from {{ ref('stg_bids') }}
),
corporate as (
    select * from {{ source('raw_data', 'corporate') }}
)

select 
    b.*,
    c.corporate_name,
    c.address_prefecture,
    c.address_city
from bids b
left join corporate c on b.corporate_number = c.corporate_number
