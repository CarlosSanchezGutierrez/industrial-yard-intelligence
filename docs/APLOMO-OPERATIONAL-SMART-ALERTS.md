# Alertas inteligentes operativas — Aplomo Systems

## Objetivo

Agregar un motor de alertas calculadas para detectar riesgos operativos, problemas de calidad de datos y bloqueos para IA.

## Archivo core

packages/sync-core/src/aplomoOperationalAlertEngine.ts

## Archivo UI

apps/web/src/internal/AplomoOperationalAlertsPanel.tsx

## Alertas consideradas

- Dispositivo GPS sin posición viva.
- Precisión GPS baja.
- Precisión GPS crítica.
- RTK no fijo.
- Dron sin altitud.
- Sin sesión activa.
- Heartbeat vencido.
- Sin conexiones online.
- Conexión degradada.
- Evento sin lineage.
- Evento con falla de calidad.
- Calidad de dato baja.
- Evento no listo para IA automática.

## Por qué importa

Una consola industrial no debe solo mostrar datos.

Debe interpretar riesgos y recomendar acciones.

Esta capa prepara el camino para:

- agentes IA supervisores
- alertas predictivas
- score operativo
- recomendaciones automáticas
- data quality gates
- cuarentena de datos
- auditoría enterprise
