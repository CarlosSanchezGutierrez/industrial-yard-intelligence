# Paso 2 — Contratos API de dispositivos y telemetría

## Objetivo

Definir los contratos compartidos entre frontend, backend y futuros gateways.

Este paso no implementa endpoints todavía. Solo define la forma oficial de los requests y responses.

## Archivos creados

- packages/api-contracts/src/aplomoCommon.ts
- packages/api-contracts/src/aplomoDeviceContracts.ts
- packages/api-contracts/src/aplomoTelemetryContracts.ts
- packages/api-contracts/src/aplomoRoutes.ts

## Qué cubre

### Dispositivos

- Registrar dispositivo.
- Actualizar dispositivo.
- Listar dispositivos.
- Obtener detalle de dispositivo.

### Sesiones

- Abrir sesión.
- Heartbeat de sesión.
- Cerrar sesión.

### Conexiones

- Abrir conexión.
- Heartbeat de conexión.
- Cerrar conexión.
- Listar conexiones vivas.

### Telemetría

- Enviar punto GPS.
- Enviar lote GPS.
- Enviar heartbeat.
- Consultar últimas posiciones.
- Consultar histórico.
- Consultar snapshot de mapa vivo.

## Regla arquitectónica

Estos contratos usan el dominio de `@iyi/domain`.

La API futura debe respetar estos contratos.

Supabase no aparece aquí porque Supabase será un adaptador, no el centro del diseño.
