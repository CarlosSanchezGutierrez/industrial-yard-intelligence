# Runtime interno compartido — Aplomo Systems

## Objetivo

Unificar el estado operativo entre el mapa interno y el panel administrativo.

## Problema anterior

El mapa y el panel podían crear simulaciones separadas.

Eso no sirve para una consola operativa real porque cada vista puede mostrar datos distintos.

## Solución

Se agregó:

apps/web/src/internal/AplomoOperationsRuntime.tsx

Este provider administra:

- runtime del simulador
- tick actual
- snapshot compartido
- eventos gobernados
- avance de simulación
- reinicio de demo

## Archivos actualizados

- apps/web/src/internal/AplomoOperationsRuntime.tsx
- apps/web/src/internal/AplomoOperationsMapPanel.tsx
- apps/web/src/internal/AplomoOperationsAdminPanel.tsx
- apps/web/src/internal/mountAplomoInternalTools.tsx

## Resultado

Ahora el mapa y el panel administrativo ven el mismo estado.

Si avanzas el mapa, cambian los datos del panel.

Si avanzas el panel, cambia el mapa.

## Siguiente paso recomendado

Agregar selección de dispositivo compartida:

- seleccionar dispositivo en el mapa
- resaltar dispositivo en tablas
- mostrar detalle lateral
- ver conexiones, sesión, precisión, eventos y lineage de ese dispositivo
