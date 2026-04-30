# Aplomo Systems

Software para patios industriales.

Aplomo Systems es una consola visual para controlar patios, materiales, GPS, evidencia y operaciones en campo.

El primer caso de uso está enfocado en Cooper/T. Smith. La visión a largo plazo es convertirlo en una plataforma SaaS industrial para puertos, cementeras, minería, construcción, patios ferroviarios, acereras, canteras, logística pesada e industria física.

Sitio público:

https://aplomosystems.com

## Problema

En patios industriales, mucha información vive en registros manuales, mensajes, fotos aisladas y memoria del personal.

Eso provoca:

- Incertidumbre sobre ubicación de materiales.
- Falta de trazabilidad.
- Registros incompletos.
- Dificultad para delimitar zonas.
- Pérdida de tiempo buscando información.
- Poca visibilidad entre campo, supervisión y administración.

## Solución

Aplomo busca convertir la operación física en datos útiles:

- Mapa.
- GPS.
- Puntos.
- Perímetros.
- Materiales.
- Evidencia.
- Responsables.
- Historial.
- Capturas de campo.
- Revisión por supervisión.

## MVP actual

El MVP web ya permite demostrar:

- Pantalla inicial.
- Consola operativa.
- Mapa.
- GPS desde navegador.
- Captura de puntos.
- Dibujo de perímetros.
- Materiales y registros.
- Simulación de campo y supervisor.
- Persistencia local.
- Deploy público en Vercel.
- Dominio propio.
- Base técnica modular con TypeScript.

## Estado real

El proyecto ya tiene una base funcional para demo.

Todavía no debe venderse como sistema final cerrado. Lo que sigue es:

- Backend público.
- Base de datos cloud.
- Autenticación real.
- Usuarios, roles y permisos.
- Evidencia con fotos y archivos.
- Sincronización real.
- Mejor experiencia móvil.
- Piloto con Cooper/T. Smith.

## Arquitectura

El proyecto está organizado como monorepo con pnpm y TypeScript.

Estructura principal:

apps/
  web/
  api/
  edge/

packages/
  kernel/
  design-tokens/
  seed-data/
  audit/
  domain/
  media/
  db/
  spatial/
  sync-protocol/
  api-contracts/
  sync-core/

## Tecnologías

- React.
- TypeScript.
- Vite.
- pnpm.
- Leaflet.
- OpenStreetMap.
- Geolocation API del navegador.
- Persistencia local.
- Node/TypeScript para API local.
- Vercel para despliegue web.

## Comandos

Instalar dependencias:

pnpm install

Build web:

pnpm --filter @iyi/web... build

Typecheck:

pnpm typecheck

Correr web local:

pnpm --filter @iyi/web dev

Stack local:

pnpm dev:stack:windows

## Vercel

Configuración correcta:

- Root Directory: ./
- Framework Preset: Vite
- Install Command: pnpm install --frozen-lockfile
- Build Command: pnpm --filter @iyi/web... build
- Output Directory: apps/web/dist

El build con tres puntos es importante:

pnpm --filter @iyi/web... build

Eso permite compilar también dependencias internas del monorepo.

## Documentación

La documentación principal está en docs/.

Archivos útiles:

- docs/APLOMO-PRESENTATION-PACK.md
- docs/APLOMO-ONE-PAGER.md
- docs/APLOMO-TECHNICAL-CONTINUITY.md
- docs/DEMO-APLOMO-COOPER.md
- docs/QA-APLOMO-MVP.md
- docs/APLOMO-REPO-INDEX.md
- docs/APLOMO-STATUS.md

## Frase guía

Aplomo Systems convierte patios industriales en operaciones digitales trazables.
