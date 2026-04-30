# Paso 3 — Motor local de dispositivos y telemetría

## Objetivo

Crear una implementación local en memoria para probar el modelo operativo de Aplomo sin depender todavía de Supabase.

## Archivo principal

packages/sync-core/src/aplomoInMemoryDeviceTelemetryStore.ts

## Qué permite

- Registrar dispositivos.
- Actualizar dispositivos.
- Listar dispositivos.
- Abrir sesiones.
- Enviar heartbeats de sesión.
- Cerrar sesiones.
- Abrir conexiones.
- Enviar heartbeats de conexión.
- Cerrar conexiones.
- Listar conexiones vivas.
- Enviar telemetría GPS.
- Enviar lotes GPS.
- Enviar heartbeat de telemetría.
- Consultar últimas posiciones.
- Consultar histórico de telemetría.
- Generar snapshot de mapa vivo.

## Por qué importa

Este motor permite construir y probar el flujo completo antes de conectar Supabase.

La arquitectura queda así:

Frontend o API
→ Contratos API
→ Store local / adaptador
→ Futuro Supabase / Postgres / MQTT / gateway

## Regla estratégica

Supabase será un adaptador.

Aplomo conserva su propio dominio, contratos y motor interno.

## Siguiente paso recomendado

Crear datos demo de varios dispositivos activos:

- Celular operador.
- Tablet supervisor.
- Dron.
- GPS profesional.
- Antena RTK.
- Camión.

Después montar un panel interno que use este store local para mostrar:

- Tabla de dispositivos.
- Tabla de sesiones.
- Tabla de conexiones.
- Últimas posiciones.
