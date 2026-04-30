# Panel de integración industrial e interoperabilidad de datos — Aplomo Systems

## Objetivo

Conectar los perfiles realistas de integración industrial al panel interno y preparar la base para interoperabilidad con herramientas de datos.

## Qué muestra el panel

Por dispositivo seleccionado:

- Patrón recomendado de conexión.
- Protocolo principal.
- Links físicos.
- Formatos de payload.
- Si requiere gateway.
- Si soporta alta precisión.
- Si requiere SDK propietario.
- Si requiere credenciales.
- Datos esperados.
- Adaptadores alternativos.
- Notas operativas.
- Notas de IA/data science.

## También agrega interoperabilidad de datos

Se modelan destinos futuros como:

- Excel.
- Power BI.
- Snowflake.
- Databricks.
- Jupyter/Python.
- LLM compatible con OpenAI.
- LLM compatible con Gemini.
- LLM compatible con Claude.
- APIs externas.

## Principio

Aplomo debe poder exportar y compartir datos gobernados.

Cada integración debe respetar:

- data contracts
- lineage
- calidad de datos
- sensibilidad
- redacción
- política de uso para IA
- tier raw/bronze/silver/gold/feature

## Archivos creados

- packages/domain/src/aplomoDataInteroperability.ts
- packages/api-contracts/src/aplomoDataInteroperabilityContracts.ts
- apps/web/src/internal/AplomoIndustrialIntegrationPanel.tsx

## Siguiente paso

Hacer que el mapa y las tablas seleccionen el dispositivo compartido con un clic.
