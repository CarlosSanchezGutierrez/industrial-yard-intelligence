# Exportación local de datos gobernados — Aplomo Systems

## Objetivo

Demostrar interoperabilidad de datos desde el panel interno.

## Archivo core

packages/sync-core/src/aplomoGovernedDataExportEngine.ts

## Archivo UI

apps/web/src/internal/AplomoGovernedDataExportPanel.tsx

## Formatos soportados

- CSV
- JSON
- NDJSON
- GeoJSON

## Datasets exportables

- Dispositivos.
- Últimas posiciones.
- Eventos de telemetría.
- Eventos gobernados.
- Alertas.
- Scores.
- Full snapshot.

## Destinos pensados

- Excel.
- Power BI.
- Python/Jupyter.
- APIs.
- Snowflake.
- Databricks.
- GIS.
- LLM tooling.
- Pipelines de datos.

## Por qué importa

Aplomo no debe ser una app cerrada.

Debe ser una plataforma de datos industrial interoperable.

Esta capa permite validar desde temprano:

- data contracts
- lineage
- quality metrics
- política de IA
- analítica
- exportabilidad
- integración enterprise
