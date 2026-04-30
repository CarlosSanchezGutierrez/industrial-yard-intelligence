# Contratos SaaS de data platform — Aplomo Systems

## Objetivo

Preparar Aplomo para endpoints reales de plataforma SaaS relacionados con datos, exportaciones, conectores y herramientas LLM.

## Archivos creados

- packages/domain/src/aplomoSaasDataPlatform.ts
- packages/api-contracts/src/aplomoSaasDataPlatformContracts.ts

## Endpoints preparados

- GET /data-products
- GET /data-products/:dataProductId
- POST /exports
- GET /exports/:exportJobId
- GET /exports
- POST /connectors
- GET /connectors
- POST /connectors/:connectorId/test
- POST /connectors/:connectorId/sync
- GET /llm-tools
- POST /llm-tools/:toolId/invoke

## Qué queda modelado

### Data products

Productos de datos gobernados para:

- dashboards
- analítica
- ciencia de datos
- IA
- clientes enterprise
- BI
- exportaciones
- APIs

### Exports

Jobs exportables hacia:

- Excel
- Power BI
- CSV
- JSON
- NDJSON
- GeoJSON
- Parquet
- Snowflake
- Databricks
- APIs
- LLM tooling

### Connectors

Conectores externos hacia:

- data warehouse
- lakehouse
- BI
- object storage
- webhooks
- APIs externas
- notebooks
- LLM providers

### LLM tools

Herramientas futuras para:

- OpenAI
- Gemini
- Claude
- custom LLMs
- copilotos industriales
- multiagentes
- diagnóstico automático
- razonamiento sobre operación

## Regla enterprise

Toda salida seria debe respetar:

- data contracts
- lineage
- quality score
- sensitivity
- redaction
- audit
- tenant isolation
- human approval cuando el riesgo lo requiera
