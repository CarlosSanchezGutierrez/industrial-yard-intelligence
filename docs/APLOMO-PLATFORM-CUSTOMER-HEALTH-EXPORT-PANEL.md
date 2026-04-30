# Platform Customer Health Export Panel

## Goal

Export customer health snapshot history from /aplomo-admin.

## Exports

- Latest per company CSV
- Full history CSV
- Full history JSON

## Why

This allows Aplomo to use health history in:

- Excel
- Power BI
- internal support workflows
- customer success reports
- investor reporting
- data engineering pipelines
- future LLM/agentic analysis

## Files

- apps/web/src/internal/AplomoPlatformHealthExportPanel.tsx
- apps/web/src/internal/mountAplomoInternalTools.tsx

## Next step

Add trend charts and deltas by customer.
