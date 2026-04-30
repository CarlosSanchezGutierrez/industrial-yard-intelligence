# Aplomo Data Quality + Lineage Core

This module makes the data governance layer visible in the internal Aplomo admin surface.

It covers:

- Data asset registry.
- Data quality rules.
- Quality run evidence.
- Data lineage edges.
- AI readiness flags.
- BI readiness flags.
- CSV and JSON exports.

## Supabase tables

- `aplomo_data_assets`
- `aplomo_data_quality_rules`
- `aplomo_data_quality_runs`
- `aplomo_data_lineage_edges`

## UI

Open:

`http://localhost:5173/aplomo-admin`

Use:

- Reload
- Create demo quality run
- Export JSON
- Export CSV

## Verification

```sql
select
  'assets' as section,
  count(*) as count
from public.aplomo_data_assets
union all
select
  'rules',
  count(*)
from public.aplomo_data_quality_rules
union all
select
  'lineage_edges',
  count(*)
from public.aplomo_data_lineage_edges;
Expected baseline:

assets: around 23
rules: around 14
lineage_edges: around 12