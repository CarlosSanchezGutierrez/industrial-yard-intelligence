# Frontend surface implementation matrix

## Executive diagnosis

The current frontend has two different realities:

1. The architecture contains many useful capabilities.
2. The current product shell does not expose them with enough clarity.

The frontend audit found:

- 214 scanned files
- 40 scanned web files
- 234 API route candidates
- 40 frontend fetch/client usages
- 23 detected components
- 22 components imported or visible by App/shell
- 22 CSS white/background risks

The important conclusion is this:

Imported does not mean product-visible.

A component can be imported by `App.tsx` but still not appear as a clear, usable module because the new `NamikiProductShell` hides old sections and only exposes selected content.

## UI product principle

The system must not look like a technical test page.

It must look like a professional operations console:

- dark by default
- no white/gray canvas
- compact typography
- visible operational modules
- technical system details hidden in internal mode
- all useful functions accessible through clear pages

## Page-level implementation matrix

| Page | Must show | Source/components/endpoints | Visibility type | Priority |
| --- | --- | --- | --- | --- |
| Inicio | Executive KPIs, alerts, module access, daily status | Namiki shell, stockpile summary, audit summary, sync summary | main cards | P0 |
| Patio | Full operational map, docks, rail, bands, zones, stockpiles, equipment | YardOperationsMapPanel, custom OperationalYardMap, future GPS/perimeters | visual map + layers | P0 |
| Materiales | All stockpiles/materials, quantities, status, owner, priority, lifecycle | StockpileDemoSummaryPanel, StockpileStatusPanel, StockpileLifecyclePanel, StockpileCreatePanel | table/cards/forms | P0 |
| Captura | GPS, perimeter drawing, evidence, measurements, drone RTK, bastones topográficos con trípode | PremiumGpsPreviewPanel, evidence endpoints, future geolocation | action workspace | P1 |
| Equipo | machinery, scales, drones RTK, crews, sensors, resources | static product module first, future endpoints | resource board | P1 |
| Historial | timeline, filters, event types, audit entries, audit mutations | AuditTimelineStoryPanel, AuditMutationPanel, audit endpoints | filterable timeline | P0 |
| Análisis | charts, comparisons, demand, scenarios, recommendations | audit summary, stockpile summary, sync summary, derived frontend metrics | dashboard | P0 |
| Envíos | sync summary, export/import, package verify, demo package, conflicts | SyncDemoStoryPanel, CloudEdgeSyncPanel, edge-client methods | operational sync board | P1 |
| Interno | health, reset, runtime probes, DB snapshot, schema, tables | RuntimeConnectionStatusPanel, DemoDataResetPanel, db endpoints | technical drawer/page | P2 |

## Components that should be surfaced more directly

| Component | Current issue | Correct placement |
| --- | --- | --- |
| StockpileStatusPanel | Exists but not surfaced as a main product module | Materiales |
| StockpileLifecyclePanel | Exists but not surfaced as product value | Materiales |
| StockpileCreatePanel | Exists but needs controlled props and a proper create/edit workspace | Materiales / Captura |
| AuditMutationPanel | Exists but not surfaced in current shell | Historial |
| CloudEdgeSyncPanel | Exists but not surfaced in current shell | Envíos |
| IndustrialValueSnapshotPanel | Exists but not product-integrated | Inicio / Análisis |
| DemoCommandCenter | Too technical for operator, but useful internally | Interno |
| DemoNavigationPanel | Replaced by shell, not needed for product | Remove from main UX |
| CockpitSectionNavigationPanel | Replaced by shell, not needed for product | Remove from main UX |
| PremiumCockpitHero | Replaced by shell, not needed | Archive |
| PremiumCockpitTabs | Replaced by shell menu | Archive |
| PremiumCockpitCommandDeck | Replaced by shell module cards | Archive |
| PremiumUxFrame | Replaced by shell copy | Archive |

## Endpoints/function groups that deserve UI

### Materials / Stockpiles

- `/stockpiles`
- stockpile lifecycle client
- stockpile create/update flows
- status dashboard
- material summaries

UI needed:

- material board
- material detail drawer
- lifecycle timeline per material
- create/edit form
- evidence attachment area

### Audit / History

- `/audit/mutations`
- `/audit/summary`
- `/audit/stockpiles/:id`
- `/audit/entries`
- `/audit/verify`

UI needed:

- timeline
- filters
- audit summary cards
- mutation table
- event detail drawer
- per-stockpile history

### Evidence / Capture

- `/evidence/register`
- `/evidence/items`
- `/evidence/summary`
- `/evidence/verify`

UI needed:

- evidence board
- capture form
- photo placeholder
- measurement detail
- GPS association
- verification status

### Sync / Offline transfer

- `/sync/summary`
- `/sync/events`
- `/sync/export`
- `/sync/import`
- `/sync/batches`
- `/sync/conflicts/resolutions`
- `/admin/demo-package`
- `/admin/demo-package/verify`
- `/admin/demo-package/import`

UI needed:

- sync health cards
- export/import workspace
- package preview
- conflict list
- verify package button
- apply/import gate

### DB / Internal

- `/db/summary`
- `/db/snapshot`
- `/db/snapshot/save`
- `/db/schema`
- `/db/tables`
- `/admin/db/snapshot`
- `/admin/db/reset`

UI needed only in internal mode:

- DB summary
- snapshot viewer
- schema viewer
- reset button
- save snapshot action

### Runtime / Demo

- `/health`
- `/admin/demo-readiness`
- `/admin/demo-report`
- `/admin/run-guided-demo`
- `/admin/reset-demo-state`

UI needed:

- internal mode
- readiness checklist
- run guided demo
- reset demo
- demo report

## Dashboard/chart opportunities

The audit did not find existing chart components, but it found enough data sources to create derived dashboards.

Recommended charts:

| Dashboard | Chart | Data source |
| --- | --- | --- |
| Materiales | material tons by zone | stockpile summary |
| Materiales | stockpile status distribution | stockpile status |
| Historial | events over time | audit entries/mutations |
| Captura | evidence count by type | evidence summary/items |
| Análisis | movements today vs yesterday | audit timeline |
| Análisis | demand/saturation scenario | derived demo data |
| Envíos | sync packages over time | sync events |
| Envíos | conflict/resolution status | sync conflicts |

## CSS cleanup requirement

The audit found 22 white/background risks.

Action:

- stop importing old premium CSS layers if they are no longer used
- keep only one final design system CSS for the shell
- remove or neutralize:
  - `premium-cockpit.css`
  - `premium-experience.css`
  - `premium-tabs.css`
  - `premium-ux-depth.css`
  - `premium-dark-product.css`
  - old white rules in `styles.css`

## Correct next implementation order

### P0. Clean visual foundation

Goal:

- remove white/gray canvas effect completely
- make shell the only visible product surface
- reduce conflicting old CSS

Files:

- `apps/web/src/App.tsx`
- `apps/web/src/styles/zzzz-namiki-professional-console.css`
- old premium CSS imports

### P0. Surface real modules

Goal:

Bring existing useful components into the shell as real pages, not hidden leftovers.

Pages:

- Materiales
- Historial
- Análisis
- Envíos

### P0. Build dashboard layer

Goal:

Create charts/dashboards from existing API data.

New components:

- `OperationsKpiDashboard`
- `MaterialDistributionDashboard`
- `AuditTimelineDashboard`
- `SyncReadinessDashboard`

### P1. Capture workspace

Goal:

Create field capture UI.

Features:

- GPS
- evidence
- measurements
- drones RTK
- bastones topográficos con trípode
- perimeter preparation

### P1. Real GPS module

Goal:

Use browser geolocation.

Features:

- request permission
- show current coordinates
- map marker
- save point
- prepare polygon/perimeter drawing

### P2. Internal admin

Goal:

Move all technical/admin concepts to internal mode.

Features:

- health
- DB snapshot
- schema
- reset
- demo readiness
- demo report
## P0 visual foundation cleanup applied

Action taken:

- Removed old CSS imports from `apps/web/src/App.tsx`.
- Added one canonical visual system:
  - `apps/web/src/styles/namiki-console-system.css`
- Kept `NamikiProductShell` as the only visible product surface.
- Hid legacy top-level sections from the normal product view.
- Forced black/dark backgrounds at root, body, main and shell levels.
- Added final overrides for old white/gray Tailwind-like utility classes inside reused components.

Reason:

The audit found multiple CSS layers and white/background risks. The product should not keep stacking old premium CSS files because they fight each other and create the white/gray canvas effect.
## P0.2 Namiki Experience Shell applied

Action taken:

- Added `NamikiExperienceShell`.
- Added one canonical visual layer:
  - `apps/web/src/styles/namiki-experience-system.css`
- Added executive dashboard, map, materials table, capture workspace, equipment board, timeline filters, analysis view, sync view and internal mode.
- Preserved existing architecture components through controlled drawers.
- Kept technical/system concepts away from the normal operations story.
## P0.3 interaction polish applied

Action taken:

- Added command deck to Inicio.
- Added material search.
- Added material status filtering.
- Added material detail panel.
- Added material action buttons.
- Added polish CSS layer:
  - `apps/web/src/styles/namiki-polish-p0-3.css`

Purpose:

Make the UI feel like an actual professional operations console, not just a visual dashboard.
## P0.4 map and timeline controls applied

Action taken:

- Added map layer controls.
- Added map operational summary cards.
- Added timeline search.
- Added priority filter.
- Added event type filters.
- Added empty state.

Files:

- `apps/web/src/components/NamikiExperienceShell.tsx`
- `apps/web/src/styles/namiki-polish-p0-4.css`
- `docs/NAMIKI_UX_POLISH_P0_4.md`
## P0.5 material history and evidence workspace applied

Action taken:

- Connected material detail to related history.
- Connected material detail to evidence records.
- Added evidence workspace under Captura.
- Added evidence queue and evidence source suggestions.

Files:

- `apps/web/src/components/NamikiExperienceShell.tsx`
- `apps/web/src/styles/namiki-polish-p0-5.css`
- `docs/NAMIKI_UX_POLISH_P0_5.md`
## P0.6 real GPS workspace applied

Action taken:

- Added real browser geolocation workspace.
- Added current coordinate display.
- Added accuracy display.
- Added current marker.
- Added saved GPS field points.
- Added conceptual perimeter preview.

Files:

- `apps/web/src/components/RealGpsWorkspace.tsx`
- `apps/web/src/styles/namiki-polish-p0-6-gps.css`
- `docs/NAMIKI_UX_POLISH_P0_6.md`
## P0.7 premium GPS address and perimeter applied

Action taken:

- Upgraded `RealGpsWorkspace`.
- Added reverse geocoding.
- Added city/state/country/neighborhood/street display.
- Added field reference for between streets/access/visual reference.
- Added localStorage persistence.
- Added material/evidence association.
- Added perimeter vertices and polygon preview.
- Added GeoJSON preview.

Files:

- `apps/web/src/components/RealGpsWorkspace.tsx`
- `apps/web/src/styles/namiki-polish-p0-7-gps-premium.css`
- `docs/NAMIKI_UX_POLISH_P0_7.md`
## P0.8 real map Leaflet GPS applied

Action taken:

- Added Leaflet and React Leaflet.
- Replaced conceptual GPS map with real OpenStreetMap tile map.
- Added click-to-select point.
- Added click-to-draw perimeter vertices.
- Added place/address search.
- Added marker layers.
- Added GeoJSON export/copy.

Files:

- `apps/web/src/components/RealGpsWorkspace.tsx`
- `apps/web/src/styles/namiki-polish-p0-8-real-map.css`
- `docs/NAMIKI_UX_POLISH_P0_8.md`