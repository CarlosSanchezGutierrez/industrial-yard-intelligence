# Detalle interno de dispositivo — Aplomo Systems

## Objetivo

Agregar una vista de detalle para administradores donde puedan analizar un dispositivo específico.

## Archivo principal

apps/web/src/internal/AplomoDeviceDetailPanel.tsx

## Qué permite ver

- Identidad del dispositivo.
- Tipo.
- Estado.
- External ID.
- Última posición.
- Precisión.
- Fix GPS.
- Estado RTK.
- Sesión activa.
- IP observada.
- Conexiones online.
- Eventos gobernados.
- Calidad de datos.
- Política de uso para IA.
- Lineage.
- Retención.
- Metadata.

## Por qué importa

Este panel es la base para una consola SaaS de administración enterprise.

Permite que administradores, analistas, ingenieros y futuros agentes de IA trabajen sobre el mismo dato operacional.

## Estado actual

La selección vive en el runtime compartido.

El detalle ya consume el mismo estado que el mapa y el panel administrativo.

## Siguiente paso recomendado

Hacer que el mapa y las tablas puedan seleccionar el dispositivo compartido con un clic.

Después:

- resaltar dispositivo seleccionado en mapa
- filtrar automáticamente tablas por dispositivo
- agregar timeline de eventos
- agregar score operativo
- agregar alertas inteligentes
