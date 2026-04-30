# Índice del repositorio

## Producto

Nombre:

Aplomo Systems

Sitio:

https://aplomosystems.com

Descripción:

Consola visual para patios industriales, GPS, materiales, evidencia y operaciones en campo.

## Carpetas principales

apps/web

Aplicación web principal. Aquí vive la consola visual.

apps/api

Backend local y rutas base para capturas GPS.

apps/edge

Base para trabajo futuro en edge/runtime.

packages

Paquetes compartidos del monorepo.

## Paquetes importantes

packages/kernel

Lógica base compartida.

packages/domain

Conceptos del negocio.

packages/spatial

Lógica geoespacial.

packages/sync-protocol

Base del protocolo de sincronización.

packages/api-contracts

Contratos entre frontend y backend.

packages/sync-core

Base de sincronización.

packages/db

Base de datos y persistencia.

packages/media

Evidencia y archivos.

packages/audit

Auditoría.

packages/design-tokens

Tokens de diseño.

packages/seed-data

Datos iniciales.

## Documentos principales

docs/APLOMO-PRESENTATION-PACK.md

Explicación completa técnico-negocio.

docs/APLOMO-ONE-PAGER.md

Resumen corto del producto.

docs/APLOMO-TECHNICAL-CONTINUITY.md

Continuidad técnica del proyecto.

docs/DEMO-APLOMO-COOPER.md

Guion de demo para Cooper/T. Smith.

docs/QA-APLOMO-MVP.md

Checklist manual de calidad.

docs/APLOMO-STATUS.md

Estado actual del proyecto.

## Validación recomendada

Antes de enseñar o subir cambios:

pnpm --filter @iyi/web... build

pnpm typecheck

Si existe QA interno:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-qa.ps1

Si existe pre-demo:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-pre-demo.ps1
