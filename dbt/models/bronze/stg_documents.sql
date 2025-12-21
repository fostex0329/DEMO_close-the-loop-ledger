select * 
from {{ source('raw_data', 'documents') }}
