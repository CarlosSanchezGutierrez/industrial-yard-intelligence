-- Aplomo Systems
-- Storage setup V1 para Supabase
-- Ejecutar después del schema principal si se quiere probar evidencia/fotos.

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'aplomo-evidence',
    'aplomo-evidence',
    false,
    10485760,
    array[
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
    ]
)
on conflict (id) do update
set
    name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Nota:
-- Las políticas de storage deben ajustarse cuando Auth y RLS estén listos.
-- Para pruebas tempranas, revisar permisos desde Supabase Dashboard.
