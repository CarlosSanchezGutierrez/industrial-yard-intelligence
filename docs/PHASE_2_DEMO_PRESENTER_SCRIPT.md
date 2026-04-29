# Phase 2 demo presenter script

## Status

PHASE_2_DEMO_PRESENTER_READY

## Opening line

Industrial Yard Intelligence convierte patios de material a granel en una operacion visible, auditable y preparada para sincronizacion edge-to-cloud.

## Demo setup

Before the live demo, run these commands:

pnpm phase2:check
pnpm --filter @iyi/web build
pnpm dev:stack:windows
pnpm phase2:runtime

Then open the Vite web cockpit.

## Demo order

### 1. Command center

Panel:

DemoCommandCenter

Say:

Este es el centro de mando de la demo. No estamos mostrando una app aislada; estamos mostrando una arquitectura local-first con Edge, Cloud API, Web cockpit, contratos compartidos, dominio, auditoria y sync seguro.

Point out:

- architecture-v1-demo-baseline
- local-first edge
- Cloud API
- web cockpit
- sync preview
- apply blocked

### 2. Section navigation

Panel:

CockpitSectionNavigationPanel

Say:

Para presentar sin perder tiempo en scroll, dividimos el cockpit en secciones: runtime, negocio, operacion, auditoria, sync y mapa de patio.

Point out:

- quick anchors
- presenter flow
- cockpit readability

### 3. Runtime status

Panel:

RuntimeConnectionStatusPanel

Say:

Antes de confiar en la demo, validamos que los servicios esten vivos. Aqui vemos Cloud API, Edge y Sync respondiendo.

Point out:

- Cloud API health
- Edge health
- Cloud sync status
- refresh action

### 4. Demo reset

Panel:

DemoDataResetPanel

Say:

Antes de presentar, puedo regresar los datos demo a un baseline limpio sin borrar archivos manualmente.

Point out:

- reset Cloud API demo data
- seed baseline
- presentation repeatability

### 5. Industrial value

Panel:

IndustrialValueSnapshotPanel

Say:

El valor para Cooper/T. Smith es convertir stockpiles fisicos en activos operacionales trazables. Esto baja dependencia de registros manuales y prepara el sistema para escalar a una plataforma SaaS industrial.

Point out:

- stockpiles trazables
- auditoria visible
- local-first
- SaaS-ready

### 6. Stockpile workflow

Panel:

StockpileDemoSummaryPanel

Say:

Aqui los stockpiles se ven como inventario operacional: material, zona, cantidad y estado. Esto permite explicar que pasa en patio de forma rapida.

Point out:

- total stockpiles
- operational
- pending review
- validated
- archived
- stockpile cards

### 7. Existing create/status panels

Panels:

StockpileCreatePanel

StockpileStatusPanel

Say:

Ahora ejecuto el flujo operador: creo un stockpile y actualizo su lifecycle. Las reglas no viven en la UI, vienen de dominio compartido.

Point out:

- create stockpile
- lifecycle statuses
- status update
- domain-driven rules

### 8. Audit timeline

Panel:

AuditTimelineStoryPanel

Say:

Cada cambio importante deja una huella. La auditoria responde quien cambio que, cuando y sobre que recurso.

Point out:

- mutation events
- stockpile entity
- actor
- timestamp
- traceability story

### 9. Sync story

Panel:

SyncDemoStoryPanel

Say:

El Edge exporta un paquete de proyeccion DB, Cloud API lo previsualiza y el modo apply permanece bloqueado. Esto es intencional: primero validamos seguridad antes de permitir ingest productivo real.

Point out:

- Cloud sync status
- Edge package export
- Cloud preview
- apply blocked
- no unsafe mutation

### 10. Yard operations map

Panel:

YardOperationsMapPanel

Say:

Esta vista conceptual conecta la app con el mundo fisico: patios, zonas, material, estados y flujo operativo. No es GIS productivo todavia; es la direccion visual hacia GPS y geoespacial.

Point out:

- yard zones
- lifecycle visual
- yard hub
- future GPS/geospatial layer

## Closing line

Lo que mostramos no es una pantalla aislada: es la base de una plataforma SaaS industrial local-first para patios, terminales y operaciones con trazabilidad.

## Questions to expect

### Is this production-ready?

Answer:

No. Es un skeleton/prototipo serio para demo tecnica. Falta auth, roles, Postgres, deploy, mobile capture, evidencia productiva, sync apply real y geoespacial avanzado.

### Why Edge and Cloud?

Answer:

Porque un patio industrial no puede depender 100% de internet. Edge permite operar localmente y Cloud permite escalar, centralizar y convertirlo en SaaS.

### Why is apply mode blocked?

Answer:

Porque aplicar datos edge-to-cloud sin reglas de conflicto, idempotencia y auditoria de ingest seria riesgoso. Primero probamos export y preview.

### What is the business value?

Answer:

Trazabilidad, menos registros manuales, visibilidad operacional, auditoria y una base para escalar a multiples patios o terminales.

### What comes next?

Answer:

Reducir clutter visual, cerrar presentacion final, definir auth/roles, plan Postgres, plan mobile GPS/evidencia y disenar sync apply real.
## Final static closure before presenting

Run:

pnpm phase2:close

Then start the local stack and run:

pnpm phase2:runtime