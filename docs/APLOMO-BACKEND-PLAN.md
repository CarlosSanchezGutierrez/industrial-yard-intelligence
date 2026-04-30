# Plan de backend público — Aplomo Systems

## Objetivo

Definir una ruta clara para pasar del MVP web actual a un sistema con backend público, base de datos y usuarios reales.

## Decisión recomendada

Para piloto:

Supabase.

Razones:

- Usa PostgreSQL.
- Incluye autenticación.
- Incluye storage para fotos y archivos.
- Puede acelerar el piloto.
- Permite crecer sin rehacer todo desde cero.
- Tiene APIs listas.
- Puede usarse con TypeScript.

## Arquitectura inicial recomendada

Frontend:

- React
- Vite
- TypeScript
- Leaflet
- Geolocation API

Backend / plataforma:

- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime o polling simple

Código compartido:

- packages/api-contracts
- packages/domain
- packages/spatial
- packages/sync-core

## Tablas iniciales

Mínimo para piloto:

- companies
- sites
- yards
- zones
- materials
- stockpiles
- gps_captures
- evidence_files
- users
- audit_events

## Flujo inicial

1. Usuario inicia sesión.
2. Usuario elige empresa/sitio.
3. Usuario abre captura GPS.
4. Sistema obtiene ubicación.
5. Usuario guarda punto o perímetro.
6. Usuario agrega nota y evidencia.
7. Captura se guarda localmente.
8. Sistema intenta sincronizar.
9. Supervisor revisa captura.
10. Se genera auditoría.

## Seguridad mínima

- Cada usuario pertenece a una empresa.
- Cada registro pertenece a una empresa.
- Un usuario no debe ver datos de otra empresa.
- Roles básicos desde el inicio.
- No exponer claves privadas en frontend.
- Usar variables de entorno.

## Variables futuras

Ejemplo:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

La service role key nunca debe ir al frontend.

## Fase 1 del backend

Crear conexión desde frontend a Supabase.

Funciones mínimas:

- Leer empresa demo.
- Leer sitio demo.
- Crear captura GPS.
- Listar capturas GPS.
- Subir evidencia.
- Consultar evidencia.

## Fase 2 del backend

Agregar:

- Roles.
- Auditoría.
- Estados de revisión.
- Sincronización más robusta.
- Exportaciones.

## Fase 3 del backend

Agregar:

- PostGIS.
- Reportes.
- Analítica.
- Realtime real.
- Integraciones.
- IA y datos.

## Riesgos

- Meter backend demasiado grande antes de validar piloto.
- Complicar auth antes de cerrar flujo de captura.
- Prometer tiempo real sin necesitarlo.
- Guardar geometrías mal desde el inicio.
- No diseñar multi-tenant desde el primer día.

## Recomendación final

La siguiente implementación técnica fuerte debe ser pequeña:

- Crear proyecto Supabase.
- Crear tablas mínimas.
- Conectar frontend.
- Guardar capturas reales.
- Subir evidencia básica.
- Mostrar capturas al supervisor.

Eso convierte Aplomo de demo visual a piloto real.
