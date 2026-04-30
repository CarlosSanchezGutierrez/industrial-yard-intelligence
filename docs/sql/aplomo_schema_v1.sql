create extension if not exists pgcrypto;

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists sites (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    name text not null,
    type text not null default 'industrial_site',
    address text,
    latitude double precision,
    longitude double precision,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists yards (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    site_id uuid not null references sites(id) on delete cascade,
    name text not null,
    description text,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zones (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    site_id uuid not null references sites(id) on delete cascade,
    yard_id uuid not null references yards(id) on delete cascade,
    name text not null,
    type text not null default 'storage_zone',
    description text,
    geometry_geojson jsonb,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists materials (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    name text not null,
    category text,
    unit text not null default 'ton',
    description text,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists profiles (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete set null,
    auth_user_id uuid unique,
    full_name text not null,
    email text unique,
    role text not null default 'operator',
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists stockpiles (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    site_id uuid not null references sites(id) on delete cascade,
    yard_id uuid not null references yards(id) on delete cascade,
    zone_id uuid references zones(id) on delete set null,
    material_id uuid references materials(id) on delete set null,
    responsible_profile_id uuid references profiles(id) on delete set null,
    name text not null,
    estimated_volume numeric,
    unit text not null default 'ton',
    geometry_geojson jsonb,
    operational_status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists gps_captures (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    site_id uuid references sites(id) on delete set null,
    yard_id uuid references yards(id) on delete set null,
    zone_id uuid references zones(id) on delete set null,
    stockpile_id uuid references stockpiles(id) on delete set null,
    captured_by_profile_id uuid references profiles(id) on delete set null,
    capture_type text not null default 'point',
    latitude double precision,
    longitude double precision,
    accuracy_meters double precision,
    geometry_geojson jsonb,
    status text not null default 'draft',
    notes text,
    captured_at timestamptz not null default now(),
    synced_at timestamptz,
    reviewed_at timestamptz,
    reviewed_by_profile_id uuid references profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists evidence_files (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    gps_capture_id uuid references gps_captures(id) on delete cascade,
    stockpile_id uuid references stockpiles(id) on delete set null,
    uploaded_by_profile_id uuid references profiles(id) on delete set null,
    file_type text not null default 'image',
    storage_path text not null,
    file_name text,
    mime_type text,
    size_bytes bigint,
    description text,
    created_at timestamptz not null default now()
);

create table if not exists audit_events (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade,
    profile_id uuid references profiles(id) on delete set null,
    entity_type text not null,
    entity_id uuid,
    action text not null,
    description text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_sites_company_id on sites(company_id);
create index if not exists idx_yards_company_id on yards(company_id);
create index if not exists idx_yards_site_id on yards(site_id);
create index if not exists idx_zones_company_id on zones(company_id);
create index if not exists idx_zones_yard_id on zones(yard_id);
create index if not exists idx_materials_company_id on materials(company_id);
create index if not exists idx_profiles_company_id on profiles(company_id);
create index if not exists idx_stockpiles_company_id on stockpiles(company_id);
create index if not exists idx_stockpiles_yard_id on stockpiles(yard_id);
create index if not exists idx_gps_captures_company_id on gps_captures(company_id);
create index if not exists idx_gps_captures_status on gps_captures(status);
create index if not exists idx_gps_captures_captured_at on gps_captures(captured_at);
create index if not exists idx_evidence_files_company_id on evidence_files(company_id);
create index if not exists idx_evidence_files_gps_capture_id on evidence_files(gps_capture_id);
create index if not exists idx_audit_events_company_id on audit_events(company_id);
create index if not exists idx_audit_events_entity on audit_events(entity_type, entity_id);

insert into companies (name, slug)
values ('Cooper/T. Smith', 'cooper-t-smith')
on conflict (slug) do nothing;
