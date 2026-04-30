# Timeline operativo por dispositivo — Aplomo Systems

## Objetivo

Agregar una vista cronológica por dispositivo seleccionado.

## Qué muestra

- Eventos GPS.
- Cambios de precisión.
- Sesiones.
- Conexiones.
- Protocolo.
- IP observada.
- Último heartbeat.
- Calidad de datos.
- Política de IA.
- Data contract.
- Lineage.
- Retención.
- Capacidad analítica.

## Por qué importa

Un administrador necesita diagnosticar qué pasó con un dispositivo sin revisar tablas separadas.

Este timeline junta operación, telemetría, gobernanza y readiness para IA en una sola vista.

## Archivo principal

apps/web/src/internal/AplomoDeviceTimelinePanel.tsx

## Siguiente paso recomendado

Agregar alertas inteligentes calculadas:

- baja precisión
- dispositivo sin heartbeat
- conexión degradada
- evento sin lineage
- evento no apto para IA
- RTK perdido
- dron sin altitud
- dispositivo sin datos recientes
