-- Aplomo Systems
-- Demo seed V1 para Supabase/PostgreSQL
-- Ejecutar después de docs/sql/aplomo_schema_v1.sql

with company_row as (
    insert into companies (name, slug, status)
    values ('Cooper/T. Smith', 'cooper-t-smith', 'active')
    on conflict (slug) do update
    set name = excluded.name,
        status = excluded.status,
        updated_at = now()
    returning id
),
site_row as (
    insert into sites (
        company_id,
        name,
        type,
        address,
        latitude,
        longitude,
        status
    )
    select
        id,
        'Puerto Altamira',
        'port_industrial_site',
        'Altamira, Tamaulipas, México',
        22.407,
        -97.938,
        'active'
    from company_row
    returning id, company_id
),
yard_row as (
    insert into yards (
        company_id,
        site_id,
        name,
        description,
        status
    )
    select
        company_id,
        id,
        'Patio demo Cooper/T. Smith',
        'Patio inicial para validar capturas GPS, materiales, evidencia y supervisión.',
        'active'
    from site_row
    returning id, company_id, site_id
),
zone_row as (
    insert into zones (
        company_id,
        site_id,
        yard_id,
        name,
        type,
        description,
        geometry_geojson,
        status
    )
    select
        company_id,
        site_id,
        id,
        'Zona demo de almacenamiento',
        'storage_zone',
        'Zona de demostración para perímetros y pilas de material.',
        '{
            "type": "Polygon",
            "coordinates": [[
                [-97.9390, 22.4074],
                [-97.9378, 22.4074],
                [-97.9378, 22.4065],
                [-97.9390, 22.4065],
                [-97.9390, 22.4074]
            ]]
        }'::jsonb,
        'active'
    from yard_row
    returning id, company_id, site_id, yard_id
),
material_row as (
    insert into materials (
        company_id,
        name,
        category,
        unit,
        description,
        status
    )
    select
        id,
        'Material demo a granel',
        'bulk_material',
        'ton',
        'Material inicial para validar flujo de patio, captura y supervisión.',
        'active'
    from company_row
    returning id, company_id
),
supervisor_row as (
    insert into profiles (
        company_id,
        full_name,
        email,
        role,
        status
    )
    select
        id,
        'Supervisor demo',
        'supervisor.demo@aplomosystems.local',
        'supervisor',
        'active'
    from company_row
    on conflict (email) do update
    set full_name = excluded.full_name,
        role = excluded.role,
        status = excluded.status,
        updated_at = now()
    returning id, company_id
),
operator_row as (
    insert into profiles (
        company_id,
        full_name,
        email,
        role,
        status
    )
    select
        id,
        'Operador demo',
        'operador.demo@aplomosystems.local',
        'operator',
        'active'
    from company_row
    on conflict (email) do update
    set full_name = excluded.full_name,
        role = excluded.role,
        status = excluded.status,
        updated_at = now()
    returning id, company_id
),
stockpile_row as (
    insert into stockpiles (
        company_id,
        site_id,
        yard_id,
        zone_id,
        material_id,
        responsible_profile_id,
        name,
        estimated_volume,
        unit,
        geometry_geojson,
        operational_status
    )
    select
        z.company_id,
        z.site_id,
        z.yard_id,
        z.id,
        m.id,
        s.id,
        'Pila demo 001',
        1250,
        'ton',
        '{
            "type": "Polygon",
            "coordinates": [[
                [-97.9388, 22.4072],
                [-97.9382, 22.4072],
                [-97.9382, 22.4068],
                [-97.9388, 22.4068],
                [-97.9388, 22.4072]
            ]]
        }'::jsonb,
        'active'
    from zone_row z
    cross join material_row m
    cross join supervisor_row s
    returning id, company_id, site_id, yard_id, zone_id
),
capture_row as (
    insert into gps_captures (
        company_id,
        site_id,
        yard_id,
        zone_id,
        stockpile_id,
        captured_by_profile_id,
        capture_type,
        latitude,
        longitude,
        accuracy_meters,
        geometry_geojson,
        status,
        notes,
        captured_at,
        synced_at
    )
    select
        p.company_id,
        p.site_id,
        p.yard_id,
        p.zone_id,
        p.id,
        o.id,
        'point',
        22.4070,
        -97.9385,
        8.5,
        '{
            "type": "Point",
            "coordinates": [-97.9385, 22.4070]
        }'::jsonb,
        'synchronized',
        'Captura demo inicial para validar flujo campo-supervisor.',
        now(),
        now()
    from stockpile_row p
    cross join operator_row o
    returning id, company_id
)
insert into audit_events (
    company_id,
    profile_id,
    entity_type,
    entity_id,
    action,
    description,
    metadata
)
select
    c.company_id,
    o.id,
    'gps_capture',
    c.id,
    'created_demo_capture',
    'Se creó una captura GPS demo para el piloto inicial.',
    '{"source": "aplomo_seed_demo_v1"}'::jsonb
from capture_row c
cross join operator_row o;
