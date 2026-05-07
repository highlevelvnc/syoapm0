-- BlindAI · Sprint 3b · Cloudflare orchestrator

-- ============================================================
-- cloudflare_connections · 1 por owner. Token encrypted-at-rest.
-- ============================================================

create table public.cloudflare_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  account_id text,
  account_name text,
  email text,
  encrypted_token text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique(owner_id)
);

create index cf_conn_owner_idx on public.cloudflare_connections(owner_id);

alter table public.cloudflare_connections enable row level security;

create policy "cf_conn: own crud"
  on public.cloudflare_connections for all using (auth.uid() = owner_id);

-- ============================================================
-- sites: adicionar campos para link a Cloudflare zone + estado hardening
-- ============================================================

alter table public.sites
  add column cloudflare_zone_id text,
  add column cloudflare_zone_name text,
  add column cloudflare_hardened_at timestamptz,
  add column cloudflare_settings_applied jsonb;

create index sites_cf_zone_idx on public.sites(cloudflare_zone_id);

-- ============================================================
-- cloudflare_actions · log de operações para auditoria
-- ============================================================

create table public.cloudflare_actions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  action text not null,
  setting text,
  status text not null check (status in ('success', 'partial', 'failed')),
  payload jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index cf_actions_site_idx on public.cloudflare_actions(site_id, created_at desc);

alter table public.cloudflare_actions enable row level security;

create policy "cf_actions: site owner reads"
  on public.cloudflare_actions for select using (
    exists (select 1 from public.sites
            where sites.id = cloudflare_actions.site_id and sites.owner_id = auth.uid())
  );
