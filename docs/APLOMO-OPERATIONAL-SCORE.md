# Score operativo — Aplomo Systems

## Objetivo

Crear un score operativo por dispositivo y por sitio.

## Archivo core

packages/sync-core/src/aplomoOperationalScoreEngine.ts

## Archivo UI

apps/web/src/internal/AplomoOperationalScorePanel.tsx

## Qué mide

- Salud de conexión.
- Precisión GPS.
- Calidad de datos.
- Readiness para IA.
- Riesgo por alertas.

## Niveles de riesgo

- excellent
- healthy
- watch
- degraded
- critical

## Por qué importa

Un administrador no puede revisar miles de eventos manualmente.

Necesita un número claro y accionable que resuma el estado de operación.

Este score será base para:

- dashboards ejecutivos
- reportes enterprise
- priorización de mantenimiento
- agentes IA supervisores
- alertas predictivas
- SLA operativo
- data products para clientes
