# Namiki Experience Shell

## Purpose

This pass upgrades the frontend from a cleaned dark shell into a stronger product experience.

## What it adds

- Executive operations dashboard
- Main KPI cards
- Material tons chart
- Demand and attention cards
- Operational map
- Material inventory table
- Capture workspace
- Equipment/resource board
- Timeline with filters
- Analysis view
- Sync view
- Internal technical mode

## UX direction

The product must look like a serious operations console:

- dark by default
- compact professional typography
- no white canvas
- useful modules visible
- technical tools hidden in internal mode
- existing architecture components still accessible
- dashboards derived from available project data

## New files

- `apps/web/src/components/NamikiExperienceShell.tsx`
- `apps/web/src/styles/namiki-experience-system.css`

## Existing components reused

- `StockpileDemoSummaryPanel`
- `OperatorWorkflowProgressPanel`
- `YardOperationsMapPanel`
- `PremiumGpsPreviewPanel`
- `AuditTimelineStoryPanel`
- `SyncDemoStoryPanel`
- `RuntimeConnectionStatusPanel`
- `DemoDataResetPanel`

## Next polish passes

1. Replace demo-derived charts with real API summaries where stable.
2. Add material detail drawer.
3. Add evidence/capture workspace.
4. Add real GPS geolocation.
5. Add perimeter drawing.
6. Add printable executive report view.