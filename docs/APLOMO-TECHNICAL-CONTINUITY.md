# Aplomo Systems — Nota técnica de continuidad

## Estado actual

El frontend web ya está desplegado públicamente en:

https://aplomosystems.com

El proyecto está organizado como monorepo TypeScript con pnpm.

El build de producción para Vercel debe seguir usando:

pnpm --filter @iyi/web... build

El sufijo `...` es importante porque compila también las dependencias internas del paquete web.

## Configuración correcta de Vercel

- Root Directory: ./
- Framework Preset: Vite
- Install Command: pnpm install --frozen-lockfile
- Build Command: pnpm --filter @iyi/web... build
- Output Directory: apps/web/dist

## Regla de trabajo

Todo cambio técnico debe ser:

- Quirúrgico.
- Modular.
- Compatible con TypeScript.
- Sin romper build.
- Sin apagar typecheck.
- Escrito en UTF-8 sin BOM.
- Probado con build y typecheck.
- Commited con mensaje claro.
- Enviado a main para deploy automático.

## Comandos de validación

Web:

pnpm --filter @iyi/web... build

Typecheck:

pnpm typecheck

API, si aplica:

pnpm --filter @iyi/api build

GPS backend local, si aplica:

pnpm dev:stack:windows
pnpm gps:smoke

## Riesgos conocidos

- No confundir Vercel con Node/API.
- No cambiar root directory a apps/api.
- No usar Output Directory dist desde raíz.
- No eliminar funciones existentes por simplificar UI.
- No prometer backend público completo todavía.
- No decir que hay app móvil nativa todavía.
- No meter cambios grandes en componentes centrales sin pruebas.
- No romper intro en celular.
- No dejar textos visibles de nombres viejos si el usuario final los ve.

## Prioridades próximas

1. Revisar producción en celular.
2. Confirmar que GPS pide permiso.
3. Confirmar que mapa carga.
4. Pulir textos visibles.
5. Preparar demo final para Cooper/T. Smith.
6. Mejorar UX móvil.
7. Definir backend público y base de datos.
8. Diseñar autenticación real.
9. Preparar piloto.
