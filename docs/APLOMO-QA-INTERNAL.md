# QA interno de Aplomo Systems

Este archivo explica el script simple de revisión del proyecto.

## Comando

Desde la raíz del repo:

.\scripts\aplomo-qa.ps1

## Qué revisa

- Archivos base del repo.
- Configuración de Vercel.
- Build correcto de web.
- Metadata básica.
- Manifest.
- Existencia del script QA.
- Existencia de esta documentación.

## Modo estricto

.\scripts\aplomo-qa.ps1 -Strict

El modo normal permite advertencias. El modo estricto falla si hay advertencias.

## Flujo recomendado

pnpm --filter @iyi/web... build
pnpm typecheck
.\scripts\aplomo-qa.ps1

## Nota

Este QA no reemplaza abrir la app en celular y revisar manualmente:

- Intro.
- Botones.
- Consola.
- Mapa.
- GPS.
- Textos visibles.
