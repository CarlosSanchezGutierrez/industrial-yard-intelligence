-- Aplomo Systems
-- Borrador RLS V1 para Supabase
-- Revisar antes de ejecutar en producción.
-- No ejecutar sin confirmar auth y perfiles.

-- Idea general:
-- Cada usuario autenticado debe tener un profile con auth_user_id = auth.uid().
-- Ese profile define company_id y role.
-- El usuario solo debe ver datos de su company_id.

-- Activar RLS cuando auth ya esté conectada:
-- alter table companies enable row level security;
-- alter table sites enable row level security;
-- alter table yards enable row level security;
-- alter table zones enable row level security;
-- alter table materials enable row level security;
-- alter table profiles enable row level security;
-- alter table stockpiles enable row level security;
-- alter table gps_captures enable row level security;
-- alter table evidence_files enable row level security;
-- alter table audit_events enable row level security;

-- Helper recomendado:
-- create or replace function current_company_id()
-- returns uuid
-- language sql
-- stable
-- as $$
--     select company_id
--     from profiles
--     where auth_user_id = auth.uid()
--     limit 1
-- $$;

-- Ejemplo para lectura por empresa:
-- create policy "read own company sites"
-- on sites
-- for select
-- using (company_id = current_company_id());

-- Ejemplo para insertar captura:
-- create policy "insert own company gps captures"
-- on gps_captures
-- for insert
-- with check (company_id = current_company_id());

-- Ejemplo para actualizar capturas:
-- create policy "update own company gps captures"
-- on gps_captures
-- for update
-- using (company_id = current_company_id())
-- with check (company_id = current_company_id());

-- Roles sugeridos:
-- admin: administra empresa completa.
-- supervisor: revisa capturas, zonas, evidencia y estados.
-- operator: crea capturas y evidencia.
-- guest: solo lectura limitada.

-- Reglas importantes:
-- No activar RLS hasta probar login y perfiles.
-- No usar service role key en frontend.
-- No permitir lectura entre empresas.
-- No permitir inserts sin company_id válido.
-- No borrar datos físicos al inicio; preferir status inactive.
