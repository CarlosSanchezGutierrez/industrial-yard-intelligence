# Mapa interno de dispositivos vivos — Aplomo Systems

## Objetivo

Agregar una vista visual tipo mapa para administradores internos.

## Archivo principal

apps/web/src/internal/AplomoOperationsMapPanel.tsx

## Cómo abrirlo

https://aplomosystems.com/?aplomoInternal=1

## Qué muestra

- Patio industrial simulado.
- Dispositivos vivos.
- Emisores.
- Receptores.
- Drones.
- RTK/GNSS.
- Camiones.
- Radio de precisión.
- Etiquetas.
- Fuente GPS.
- Tabla de posiciones vivas.

## Qué permite

- Avanzar simulación.
- Reiniciar mapa.
- Filtrar por fuente.
- Encender/apagar capas.
- Ver precisión por dispositivo.
- Identificar dispositivos submétricos.

## Decisión técnica

Este mapa no usa todavía Leaflet, Mapbox ni Cesium.

Es un SVG operativo propio.

Razón:

- No mete dependencias nuevas.
- Compila rápido.
- Permite diseñar UX de administración.
- Evita acoplar el producto a un proveedor de mapas antes de terminar el modelo operativo.

## Siguiente evolución

- Compartir runtime con el panel de administración.
- Añadir selección de dispositivo.
- Añadir detalle lateral.
- Añadir rutas.
- Añadir zonas/geocercas.
- Añadir objetos prefabricados.
- Luego migrar a mapa geoespacial real.
