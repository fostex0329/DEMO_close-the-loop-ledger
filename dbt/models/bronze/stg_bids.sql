select * 
from {{ source('raw_data', 'bids') }}
qualify row_number() over (partition by sequence_no order by snapshot_date desc) = 1
