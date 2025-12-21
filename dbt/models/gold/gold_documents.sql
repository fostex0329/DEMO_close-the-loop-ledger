{{ config(materialized='table') }}

with docs as (
    select * from {{ ref('stg_documents') }}
)

select
    doc_id,
    filename,
    doc_type,
    content,
    created_at
from docs
