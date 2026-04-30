# Plan de migración a backend real — Aplomo Systems

## Paso 1

Crear schema SQL V1.

Estado:

Listo con `docs/sql/aplomo_schema_v1.sql`.

## Paso 2

Crear proyecto Supabase.

Debe ser un proyecto separado para Aplomo.

## Paso 3

Crear tablas con el SQL.

Validar que existen:

- companies
- sites
- yards
- zones
- materials
- profiles
- stockpiles
- gps_captures
- evidence_files
- audit_events

## Paso 4

Crear datos demo

Mínimo:

- Empresa: Cooper/T. Smith
- Sitio: Puerto Altamira
- Patio: Patio demo
- Material: Material demo

## Paso 5

Conectar frontend

Primera conexión real:

- Crear captura GPS en Supabase.
- Listar capturas.
- Mostrar estado de sincronización.

## Paso 6

Evidencia

Después de capturas:

- Crear bucket.
- Subir foto.
- Asociar foto a captura.

## Paso 7

Auth

Después de validar captura:

- Login.
- Roles.
- Empresa por usuario.
- Permisos básicos.

## Regla

No meter todo de golpe.

Primero guardar capturas reales.

Después evidencia.

Después usuarios.

Después permisos avanzados.
