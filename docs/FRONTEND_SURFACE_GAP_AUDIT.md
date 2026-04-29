# Frontend surface gap audit

## Resumen ejecutivo

Este reporte compara lo que existe en código contra lo que está visible en la interfaz actual.

| Métrica | Total |
| --- | ---: |
| Archivos escaneados | 214 |
| Archivos web escaneados | 40 |
| Endpoints/rutas candidatas | 234 |
| Consumos fetch/client detectados | 40 |
| Componentes detectados | 23 |
| Componentes visibles/importados por shell/App | 22 |
| Componentes posiblemente ocultos | 1 |
| Riesgos de fondo blanco en CSS | 22 |

## Prioridad alta: cosas que probablemente deberían mostrarse

| Archivo | Componentes | Categoría | Score | Fetch | Charts | Botones/forms |
| --- | --- | --- | --- | --- | --- | --- |
| apps/web/src/App.tsx | App | dashboard/graficas, mapa/GPS/perimetros, materiales/stockpiles, historial/auditoria, envios/sincronizacion, analisis/demanda, filtros, equipo/captura | 42 | 0 | 0 | 19/3 |


## Prioridad media: revisar para diseño

_Sin resultados._


## Componentes visibles actualmente

| Archivo | Componentes | Shell | App | Términos |
| --- | --- | --- | --- | --- |
| apps/web/src/components/NamikiProductShell.tsx | AnalisisPage, CapturaPage, EnviosPage, EquipoPage, HistorialPage, InicioPage, InternoPage, MaterialBoard, MaterialesPage, NamikiProductShell, OperationalYardMap, PageHeader, PatioPage, ProductCard, ProductDrawer, StatCar | sí | sí | audit, bascula, báscula, comparison, demand, demanda, drone, drones |
| apps/web/src/components/YardOperationsMapPanel.tsx | FlowStep, MapSignalCard, YardOperationsMapPanel, YardZoneBlock | sí | sí | audit, cloud, edge, evidencia, gps, historial, kpi, map |
| apps/web/src/components/AuditTimelineStoryPanel.tsx | AuditEventCard, AuditTimelineStoryPanel, MetricCard | sí | sí | audit, cloud, filter, kpi, map, metric, metrics, mutation |
| apps/web/src/components/StockpileDemoSummaryPanel.tsx | MetricCard, StockpileCard, StockpileDemoSummaryPanel | sí | sí | cloud, filter, kpi, map, material, metric, metrics, stockpile |
| apps/web/src/components/AuditMutationPanel.tsx | AuditEntryRow, AuditMutationPanel | no | sí | audit, cloud, compare, dashboard, history, kpi, map, mutation |
| apps/web/src/components/IndustrialValueSnapshotPanel.tsx | IndustrialValueSnapshotPanel, ProofPointCard, ValueMetricCard | no | sí | audit, cloud, edge, evidencia, gps, historial, kpi, map |
| apps/web/src/components/StockpileStatusPanel.tsx | StockpileStatusPanel | no | sí | cloud, dashboard, filter, kpi, map, material, stockpile, stockpiles |
| apps/web/src/components/DemoCommandCenter.tsx | DemoCommandCenter, DemoStepCard, StatusPill | no | sí | audit, cloud, edge, evidencia, kpi, map, material, stockpile |
| apps/web/src/components/DemoNavigationPanel.tsx | DemoNavigationPanel, DemoSectionCard | no | sí | audit, cloud, edge, evidencia, historial, history, kpi, map |
| apps/web/src/components/OperatorWorkflowProgressPanel.tsx | OperatorWorkflowProgressPanel, SignalCard, WorkflowStageCard | sí | sí | audit, cloud, edge, historial, kpi, map, material, operator |
| apps/web/src/components/CockpitSectionNavigationPanel.tsx | CockpitSectionNavigationPanel, SectionLinkCard | no | sí | audit, cloud, edge, kpi, map, material, stockpile, stockpiles |
| apps/web/src/components/RuntimeConnectionStatusPanel.tsx | RuntimeConnectionStatusPanel, RuntimeProbeCard | sí | sí | audit, cloud, edge, filter, kpi, map, offline, stockpile |
| apps/web/src/components/PremiumCockpitTabs.tsx | PremiumCockpitTabs | no | sí | audit, gps, historial, history, kpi, location, map, material |
| apps/web/src/components/PremiumGpsPreviewPanel.tsx | PremiumGpsPreviewPanel | sí | sí | gps, map, material, perímetro, zone |
| apps/web/src/components/StockpileCreatePanel.tsx | StockpileCreatePanel | no | sí | cloud, dashboard, kpi, material, operator, stockpile, sync |
| apps/web/src/components/StockpileLifecyclePanel.tsx | StockpileLifecyclePanel | no | sí | cloud, dashboard, kpi, map, stockpile, stockpiles, sync |
| apps/web/src/components/PremiumCockpitHero.tsx | ExecutiveSignalCard, PremiumCockpitHero | no | sí | audit, gps, historial, kpi, map, material, perímetro |
| apps/web/src/components/SyncDemoStoryPanel.tsx | SyncDemoStoryPanel, SyncPackageSummary, SyncStepCard | sí | sí | cloud, edge, map, sync |
| apps/web/src/components/CloudEdgeSyncPanel.tsx | CloudEdgeSyncPanel, ResultBox | no | sí | cloud, edge, kpi, sync |
| apps/web/src/components/DemoDataResetPanel.tsx | DemoDataResetPanel | sí | sí | cloud, kpi, stockpile, stockpiles, sync |
| apps/web/src/components/PremiumCockpitCommandDeck.tsx | CommandCard, PremiumCockpitCommandDeck | no | sí | audit, historial, kpi, map, material |
| apps/web/src/components/PremiumUxFrame.tsx | PremiumUxFrame, UxSignalCard | no | sí | gps, historial, map, material |


## Endpoints/rutas candidatas detectadas

| Método | Ruta | Archivo |
| --- | --- | --- |
| UNKNOWN | /admin/db/reset | apps/api/src/routes.test.ts:355 |
| GET | /admin/db/reset | apps/api/src/routes.ts:301 |
| GET | /admin/db/reset | packages/api-contracts/src/cloud-api.test.ts:20 |
| GET | /admin/db/reset | packages/api-contracts/src/cloud-api.ts:242 |
| UNKNOWN | /admin/db/snapshot | apps/api/src/routes.test.ts:331 |
| GET | /admin/db/snapshot | apps/api/src/routes.ts:292 |
| GET | /admin/db/snapshot | packages/api-contracts/src/cloud-api.test.ts:19 |
| GET | /admin/db/snapshot | packages/api-contracts/src/cloud-api.ts:237 |
| GET | /admin/demo-package | apps/edge/src/demo-package-import.test.ts:31 |
| GET | /admin/demo-package | apps/edge/src/demo-package-import.test.ts:127 |
| GET | /admin/demo-package | apps/edge/src/demo-package-upload-verify.test.ts:31 |
| GET | /admin/demo-package | apps/edge/src/demo-package-upload-verify.test.ts:87 |
| GET | /admin/demo-package | apps/edge/src/demo-package.test.ts:31 |
| GET | /admin/demo-package | apps/edge/src/demo-package.test.ts:108 |
| GET | /admin/demo-package | apps/edge/src/demo-package.test.ts:165 |
| GET | /admin/demo-package | apps/edge/src/routes.ts:213 |
| GET | /admin/demo-package | apps/edge/src/routes.ts:1170 |
| POST | /admin/demo-package/import | apps/edge/src/demo-package-import.test.ts:51 |
| POST | /admin/demo-package/import | apps/edge/src/demo-package-import.test.ts:147 |
| POST | /admin/demo-package/import | apps/edge/src/demo-package-import.test.ts:189 |
| GET | /admin/demo-package/import | apps/edge/src/routes.ts:216 |
| POST | /admin/demo-package/import | apps/edge/src/routes.ts:1143 |
| POST | /admin/demo-package/verify | apps/edge/src/demo-package-upload-verify.test.ts:44 |
| POST | /admin/demo-package/verify | apps/edge/src/demo-package-upload-verify.test.ts:112 |
| POST | /admin/demo-package/verify | apps/edge/src/demo-package-upload-verify.test.ts:144 |
| GET | /admin/demo-package/verify | apps/edge/src/demo-package-verify.test.ts:31 |
| GET | /admin/demo-package/verify | apps/edge/src/demo-package-verify.test.ts:85 |
| GET | /admin/demo-package/verify | apps/edge/src/routes.ts:214 |
| POST | /admin/demo-package/verify | apps/edge/src/routes.ts:215 |
| POST | /admin/demo-package/verify | apps/edge/src/routes.ts:1146 |
| GET | /admin/demo-package/verify | apps/edge/src/routes.ts:1158 |
| GET | /admin/demo-readiness | apps/edge/src/demo-readiness.test.ts:21 |
| GET | /admin/demo-readiness | apps/edge/src/demo-readiness.test.ts:64 |
| GET | /admin/demo-readiness | apps/edge/src/demo-readiness.test.ts:124 |
| GET | /admin/demo-readiness | apps/edge/src/routes.ts:210 |
| POST | /admin/demo-readiness | apps/edge/src/routes.ts:1185 |
| GET | /admin/demo-report | apps/edge/src/demo-report.test.ts:21 |
| GET | /admin/demo-report | apps/edge/src/demo-report.test.ts:63 |
| GET | /admin/demo-report | apps/edge/src/demo-report.test.ts:129 |
| GET | /admin/demo-report | apps/edge/src/routes.ts:212 |
| GET | /admin/demo-report | apps/edge/src/routes.ts:1131 |
| POST | /admin/reset-demo-state | apps/edge/src/demo-package-import.test.ts:44 |
| POST | /admin/reset-demo-state | apps/edge/src/demo-reset.test.ts:50 |
| POST | /admin/reset-demo-state | apps/edge/src/demo-reset.test.ts:103 |
| POST | /admin/reset-demo-state | apps/edge/src/routes.ts:209 |
| POST | /admin/reset-demo-state | apps/edge/src/routes.ts:1182 |
| POST | /admin/run-guided-demo | apps/edge/src/db-projection.test.ts:37 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-package-import.test.ts:21 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-package-import.test.ts:117 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-package-upload-verify.test.ts:21 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-package-upload-verify.test.ts:77 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-package-verify.test.ts:21 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-package.test.ts:21 |
| POST | /admin/run-guided-demo | apps/edge/src/demo-report.test.ts:53 |
| POST | /admin/run-guided-demo | apps/edge/src/guided-demo.test.ts:21 |
| POST | /admin/run-guided-demo | apps/edge/src/guided-demo.test.ts:98 |
| POST | /admin/run-guided-demo | apps/edge/src/routes.ts:211 |
| GET | /admin/run-guided-demo | apps/edge/src/routes.ts:1128 |
| GET | /audit/entries | apps/edge/src/routes.ts:202 |
| POST | /audit/entries | apps/edge/src/routes.ts:1094 |
| GET | /audit/mutations | apps/api/src/audit-mutation-route-wrapper.test.ts:229 |
| GET | /audit/mutations | apps/api/src/audit-mutation-route-wrapper.ts:264 |
| GET | /audit/mutations | packages/api-contracts/src/cloud-api.ts:172 |
| POST | /audit/stockpiles/:id | packages/api-contracts/src/cloud-api.ts:167 |
| GET | /audit/stockpiles/stockpile_001 | apps/api/src/audit-mutation-route-wrapper.test.ts:412 |
| GET | /audit/summary | apps/api/src/audit-mutation-route-wrapper.test.ts:310 |
| GET | /audit/summary | apps/api/src/audit-mutation-route-wrapper.ts:270 |
| GET | /audit/summary | apps/edge/src/audit-store.test.ts:148 |
| GET | /audit/summary | apps/edge/src/evidence-store.test.ts:108 |
| GET | /audit/summary | apps/edge/src/routes.ts:203 |
| POST | /audit/summary | apps/edge/src/routes.ts:1098 |
| GET | /audit/summary | packages/api-contracts/src/cloud-api.ts:177 |
| GET | /audit/verify | apps/edge/src/audit-store.test.ts:155 |
| GET | /audit/verify | apps/edge/src/routes.ts:204 |
| GET | /audit/verify | apps/edge/src/routes.ts:1102 |
| GET | /db/schema | apps/api/src/routes.test.ts:134 |
| GET | /db/schema | apps/api/src/routes.ts:197 |
| GET | /db/schema | packages/api-contracts/src/cloud-api.ts:192 |
| GET | /db/snapshot | apps/edge/src/db-projection.test.ts:87 |
| GET | /db/snapshot | apps/edge/src/db-projection.test.ts:159 |
| GET | /db/snapshot | apps/edge/src/edge-cloud-sync-export-route-wrapper.test.ts:40 |
| GET | /db/snapshot | apps/edge/src/edge-cloud-sync-export-route-wrapper.ts:171 |
| GET | /db/snapshot | apps/edge/src/edge-cloud-sync-export-route-wrapper.ts:172 |
| GET | /db/snapshot | apps/edge/src/edge-cloud-sync-export-route-wrapper.ts:173 |
| GET | /db/snapshot | apps/edge/src/routes.ts:218 |
| GET | /db/snapshot | apps/edge/src/routes.ts:1210 |
| POST | /db/snapshot/save | apps/edge/src/db-projection.test.ts:115 |
| GET | /db/snapshot/save | apps/edge/src/db-projection.test.ts:161 |
| POST | /db/snapshot/save | apps/edge/src/routes.ts:219 |
| POST | /db/snapshot/save | apps/edge/src/routes.ts:1223 |
| GET | /db/summary | apps/edge/src/db-projection.test.ts:61 |
| GET | /db/summary | apps/edge/src/db-projection.test.ts:158 |
| GET | /db/summary | apps/edge/src/routes.ts:217 |
| GET | /db/summary | apps/edge/src/routes.ts:1197 |
| GET | /db/tables | apps/api/src/routes.ts:206 |
| GET | /db/tables | packages/api-contracts/src/cloud-api.ts:197 |
| GET | /evidence/items | apps/edge/src/routes.ts:206 |
| POST | /evidence/items | apps/edge/src/routes.ts:1113 |
| POST | /evidence/register | apps/edge/src/demo-readiness.test.ts:52 |
| POST | /evidence/register | apps/edge/src/demo-reset.test.ts:21 |
| POST | /evidence/register | apps/edge/src/evidence-store.test.ts:13 |
| POST | /evidence/register | apps/edge/src/evidence-store.test.ts:69 |
| POST | /evidence/register | apps/edge/src/evidence-store.test.ts:131 |
| POST | /evidence/register | apps/edge/src/evidence-store.test.ts:154 |
| POST | /evidence/register | apps/edge/src/evidence-store.test.ts:216 |
| POST | /evidence/register | apps/edge/src/routes.ts:205 |
| GET | /evidence/register | apps/edge/src/routes.ts:1109 |
| GET | /evidence/summary | apps/edge/src/demo-reset.test.ts:33 |
| GET | /evidence/summary | apps/edge/src/evidence-store.test.ts:166 |
| GET | /evidence/summary | apps/edge/src/routes.ts:207 |
| POST | /evidence/summary | apps/edge/src/routes.ts:1117 |
| GET | /evidence/verify | apps/edge/src/evidence-store.test.ts:173 |
| GET | /evidence/verify | apps/edge/src/routes.ts:208 |
| GET | /evidence/verify | apps/edge/src/routes.ts:1121 |
| GET | /health | apps/api/src/cloud-edge-sync-route-wrapper.test.ts:171 |
| POST | /health | apps/api/src/routes.test.ts:85 |
| POST | /health | apps/api/src/routes.test.ts:90 |
| UNKNOWN | /health | apps/api/src/routes.test.ts:110 |
| GET | /health | apps/api/src/routes.test.ts:121 |
| GET | /health | apps/api/src/routes.ts:186 |


## Consumos desde frontend detectados

| Archivo | Uso | Términos |
| --- | --- | --- |
| apps/web/src/App.tsx:6 | client. |  |
| apps/web/src/App.tsx:42 | client. |  |
| apps/web/src/components/AuditMutationPanel.tsx:12 | client. |  |
| apps/web/src/components/AuditTimelineStoryPanel.tsx:67 | fetch(url, { headers: { accept: "application/json", "x-request-id": "web-audit-timeline-story", }, signal: controller.signal, }) | audit, timeline |
| apps/web/src/components/CloudEdgeSyncPanel.tsx:14 | client. |  |
| apps/web/src/components/DemoDataResetPanel.tsx:63 | fetch(`${getApiBaseUrl() |  |
| apps/web/src/components/RuntimeConnectionStatusPanel.tsx:56 | fetch(url, { headers: { accept: "application/json", "x-request-id": "web-runtime-connection-status", }, }) |  |
| apps/web/src/components/StockpileCreatePanel.tsx:2 | client. |  |
| apps/web/src/components/StockpileDemoSummaryPanel.tsx:257 | fetch(`${getApiBaseUrl() |  |
| apps/web/src/components/StockpileLifecyclePanel.tsx:6 | client. |  |
| apps/web/src/components/StockpileStatusPanel.tsx:6 | client. |  |
| apps/web/src/components/StockpileStatusPanel.tsx:10 | client. |  |
| apps/web/src/components/SyncDemoStoryPanel.tsx:207 | fetch(url, { ...init, headers: { accept: "application/json", "content-type": "application/json", "x-request-id": "web-sync-demo-story", ...(init?.headers ?? {}) | sync |
| apps/web/src/data/api-client.ts:63 | fetch(`${apiBaseUrl}${path}`, { method: "GET", headers: { accept: "application/json" } }) |  |
| apps/web/src/data/api-client.ts:89 | fetch(`${apiBaseUrl}${path}`, { method, headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify(payload) |  |
| apps/web/src/data/audit-client.ts:109 | fetch(`${baseUrl.replace(/\/+$/u, "") |  |
| apps/web/src/data/cloud-edge-sync-client.ts:86 | fetch(`${baseUrl.replace(/\/+$/u, "") |  |
| apps/web/src/data/edge-client.ts:435 | fetch(`${edgeBaseUrl}/seed/cooper-smoke`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:535 | fetch(`${edgeBaseUrl}/sync/batches`, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify(request) | edge, sync |
| apps/web/src/data/edge-client.ts:636 | fetch(`${edgeBaseUrl}/admin/run-guided-demo`, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ resetBeforeRun: true }) | edge |
| apps/web/src/data/edge-client.ts:697 | fetch(`${edgeBaseUrl}/sync/summary`, { method: "GET", headers: { accept: "application/json" } }) | edge, sync |
| apps/web/src/data/edge-client.ts:703 | fetch(`${edgeBaseUrl}/sync/events`, { method: "GET", headers: { accept: "application/json" } }) | edge, sync |
| apps/web/src/data/edge-client.ts:709 | fetch(`${edgeBaseUrl}/sync/conflicts/resolutions`, { method: "GET", headers: { accept: "application/json" } }) | edge, sync |
| apps/web/src/data/edge-client.ts:715 | fetch(`${edgeBaseUrl}/audit/summary`, { method: "GET", headers: { accept: "application/json" } }) | audit, edge |
| apps/web/src/data/edge-client.ts:721 | fetch(`${edgeBaseUrl}/audit/entries`, { method: "GET", headers: { accept: "application/json" } }) | audit, edge |
| apps/web/src/data/edge-client.ts:727 | fetch(`${edgeBaseUrl}/evidence/summary`, { method: "GET", headers: { accept: "application/json" } }) | edge, evidence |
| apps/web/src/data/edge-client.ts:733 | fetch(`${edgeBaseUrl}/evidence/items`, { method: "GET", headers: { accept: "application/json" } }) | edge, evidence |
| apps/web/src/data/edge-client.ts:739 | fetch(`${edgeBaseUrl}/evidence/verify`, { method: "GET", headers: { accept: "application/json" } }) | edge, evidence |
| apps/web/src/data/edge-client.ts:745 | fetch(`${edgeBaseUrl}/admin/demo-readiness`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:876 | fetch(`${edgeBaseUrl}/admin/demo-report`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:917 | fetch(`${edgeBaseUrl}/admin/demo-package`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:958 | fetch(`${edgeBaseUrl}/admin/demo-package/verify`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:1001 | fetch(`${edgeBaseUrl}/admin/demo-package/verify`, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ package: packageData }) | edge |
| apps/web/src/data/edge-client.ts:1113 | fetch(`${edgeBaseUrl}/admin/reset-demo-state`, { method: "POST", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:1142 | fetch(`${edgeBaseUrl}/sync/export`, { method: "GET", headers: { accept: "application/json" } }) | edge, sync |
| apps/web/src/data/edge-client.ts:1214 | fetch(`${edgeBaseUrl}/sync/import`, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ replaceExistingStore, store }) | edge, sync |
| apps/web/src/data/edge-client.ts:1299 | fetch(`${edgeBaseUrl}/db/summary`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:1347 | fetch(`${edgeBaseUrl}/db/snapshot`, { method: "GET", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/edge-client.ts:1396 | fetch(`${edgeBaseUrl}/db/snapshot/save`, { method: "POST", headers: { accept: "application/json" } }) | edge |
| apps/web/src/data/stockpile-lifecycle-client.ts:46 | fetch(`${baseUrl.replace(/\/+$/u, "") |  |


## Riesgos de fondos blancos o texto blanco mal aplicado en CSS

| Archivo | Regla |
| --- | --- |
| apps/web/src/styles.css:350 | color: #fff |
| apps/web/src/styles/premium-cockpit.css:90 | color: white |
| apps/web/src/styles/premium-cockpit.css:173 | color: white |
| apps/web/src/styles/premium-cockpit.css:174 | background: rgba(255, 255, 255, 0.1) |
| apps/web/src/styles/premium-cockpit.css:183 | background: rgba(255, 255, 255, 0.18) |
| apps/web/src/styles/premium-cockpit.css:191 | background: rgba(255, 255, 255, 0.08) |
| apps/web/src/styles/premium-cockpit.css:205 | color: white |
| apps/web/src/styles/premium-cockpit.css:266 | color: white |
| apps/web/src/styles/premium-dark-product.css:243 | color: white |
| apps/web/src/styles/premium-dark-product.css:362 | color: white |
| apps/web/src/styles/premium-experience.css:228 | color: white |
| apps/web/src/styles/premium-experience.css:262 | color: white |
| apps/web/src/styles/premium-experience.css:280 | color: white |
| apps/web/src/styles/premium-experience.css:353 | color: white |
| apps/web/src/styles/premium-experience.css:354 | background: rgba(255, 255, 255, 0.1) |
| apps/web/src/styles/premium-experience.css:384 | background: rgba(255, 255, 255, 0.08) |
| apps/web/src/styles/premium-experience.css:398 | color: white |
| apps/web/src/styles/premium-tabs.css:102 | color: white |
| apps/web/src/styles/premium-ux-depth.css:111 | background: rgba(255, 255, 255, 0.72) |
| apps/web/src/styles/premium-ux-depth.css:255 | background: rgba(255, 255, 255, 0.86) |
| apps/web/src/styles/premium-ux-depth.css:268 | background: #fff |
| apps/web/src/styles/premium-ux-depth.css:278 | color: white |


## Plan de superficie recomendado

### Inicio

- resumen ejecutivo de capacidades
- KPIs principales
- alertas operativas
- accesos a módulos

### Patio

- mapa operativo visual
- zonas configurables
- rutas, muelles, básculas, bodegas
- capas de GPS/perímetros

### Materiales

- todos los stockpiles/materiales
- cantidad, zona, estado, prioridad, responsable
- formularios de registro/edición si existen
- historial por material

### Captura

- GPS real
- perímetros/polígonos
- evidencias
- drones RTK
- bastones topográficos con trípode
- mediciones

### Equipo

- maquinaria
- básculas
- cuadrillas
- drones
- sensores futuros
- estado operativo

### Historial

- línea del tiempo
- filtros
- eventos por material/zona/responsable
- auditoría entendible

### Análisis

- gráficas existentes
- dashboards
- comparación por tiempo
- demanda
- escenarios
- recomendaciones

### Envíos

- sync
- export/import
- paquetes
- estado offline/local
- preview antes de aplicar

### Interno

- API
- Edge
- runtime
- reset
- checks técnicos


## Decisión recomendada

Antes de seguir diseñando a ciegas, el siguiente paso debe ser convertir este reporte en una matriz:

- Qué existe.
- Qué sí aparece.
- Qué no aparece.
- En qué página debe aparecer.
- Si será vista principal, card, drawer, filtro, gráfica o modo interno.

Después de eso ya se rediseña con precisión.
