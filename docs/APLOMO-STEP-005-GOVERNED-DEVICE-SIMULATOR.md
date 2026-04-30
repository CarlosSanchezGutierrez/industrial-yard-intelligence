# Paso 5 — Simulador gobernado de dispositivos vivos

## Objetivo

Crear un simulador local que genere datos realistas de dispositivos industriales vivos con gobernanza desde el origen.

## Archivo principal

packages/sync-core/src/aplomoGovernedDeviceSimulator.ts

## Qué simula

- Celular de operador.
- Tablet de supervisor.
- Dron de inspección.
- Bastón GNSS/RTK.
- Antena RTK base.
- Camión interno.

## Qué genera

- Dispositivos registrados.
- Sesiones activas.
- Conexiones activas.
- Posiciones GPS.
- Calidad GPS.
- Eventos gobernados.
- Data contracts.
- Lineage.
- Métricas de calidad.
- Política de uso para IA.
- Últimas posiciones vivas.

## Por qué importa

Este simulador permite construir frontend, tablas, mapas, pruebas y pipelines sin depender todavía de hardware real ni Supabase.

También evita crear datos basura.

Cada evento nace con:

- Contrato de datos.
- Sensibilidad.
- Retención.
- Calidad.
- Lineage.
- Política IA.
- Tags analíticos.

## Futuro habilitado

Este patrón permite después crear:

- Pipelines bronze/silver/gold.
- Feature store.
- Simulaciones de operación.
- Agentes IA supervisores.
- Detección de anomalías.
- Dashboards para analistas.
- Data products para clientes enterprise.
