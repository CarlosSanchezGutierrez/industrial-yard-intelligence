# Seguridad Supabase V1 — Aplomo Systems

## Objetivo

Preparar la lógica de seguridad para cuando Aplomo tenga usuarios reales.

## Archivo

docs/sql/aplomo_rls_draft_v1.sql

## Estado

Es un borrador.

No debe ejecutarse sin antes tener:

- Supabase Auth configurado.
- Tabla profiles conectada con auth_user_id.
- Usuarios reales de prueba.
- Revisión de permisos.

## Regla principal

Cada registro debe pertenecer a una empresa.

Un usuario solo debe ver y modificar datos de su empresa.

## Roles iniciales

Admin:

- Gestiona empresa.
- Gestiona usuarios.
- Ve todo.

Supervisor:

- Revisa capturas.
- Aprueba o rechaza.
- Consulta evidencia.

Operador:

- Crea capturas.
- Sube evidencia.
- Ve su trabajo.

Invitado:

- Lectura limitada.

## Recomendación

Primero conectar capturas GPS sin RLS fuerte.

Después conectar login.

Después activar RLS en ambiente de prueba.

Después pasar a piloto.
