-- BlindAI · Sprint 7 · Privacy policy / DPA generator
-- Cada site pode ter 1 policy publicada em /p/[site_id].

create table public.policies (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  country text not null check (country in ('PT', 'BR', 'EN', 'ES', 'FR')),
  operator_name text not null,
  contact_email text not null,
  contact_address text,
  collected_data jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  generated_html text,
  version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(site_id)
);

create index policies_site_idx on public.policies(site_id);

alter table public.policies enable row level security;

create policy "policies: site owner crud"
  on public.policies for all using (
    exists (
      select 1 from public.sites
      where sites.id = policies.site_id and sites.owner_id = auth.uid()
    )
  );
