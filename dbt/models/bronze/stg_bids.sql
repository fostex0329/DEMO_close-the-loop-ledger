select * 
from {{ source('raw_data', 'bids') }}
