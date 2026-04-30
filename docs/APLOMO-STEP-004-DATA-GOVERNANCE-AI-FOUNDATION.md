# Paso 4 — Base de gobernanza de datos e IA

## Objetivo

Crear una capa transversal para que Aplomo Systems pueda crecer como SaaS industrial serio, preparado para analítica, ciencia de datos, automatización avanzada, IA y multiagentes.

## Por qué va antes del simulador

El simulador generará eventos, telemetría, posiciones, conexiones, evidencia y datos operativos.

Si generamos datos sin gobernanza desde el inicio, después habría que limpiar y rediseñar.

Por eso primero definimos:

- Data contracts.
- Clasificación de sensibilidad.
- Calidad de datos.
- Lineage.
- Retención.
- Política de uso para IA.
- Eventos gobernados.
- Tiers de datos.

## Archivos creados

- packages/domain/src/aplomoDataGovernance.ts
- packages/api-contracts/src/aplomoDataGovernanceContracts.ts

## Capas de datos

Raw:

Datos tal como llegan.

Bronze:

Datos persistidos con validación mínima.

Silver:

Datos limpios, normalizados y trazables.

Gold:

Datos listos para dashboards, negocio y operación.

Feature:

Datos listos para modelos de IA.

Model output:

Resultados generados por IA, agentes o modelos predictivos.

## Principio clave

No todo dato debe alimentar IA.

Cada dato debe declarar:

- Sensibilidad.
- Política de uso para IA.
- Calidad.
- Lineage.
- Retención.
- Contrato.

## Futuro habilitado

Esta base permite construir después:

- Data lake.
- Feature store.
- Auditoría de modelos.
- Multiagentes.
- Copilotos industriales.
- Predicción operativa.
- Detección de anomalías.
- Recomendaciones automáticas.
- Reportes para analistas.
- Gobierno de datos para enterprise.
