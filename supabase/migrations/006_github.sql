-- BlindAI · Sprint 6 · GitHub Dependabot CVE scanner

-- Adicionar 'dependencies' à enum de category
alter table public.scan_findings drop constraint scan_findings_category_check;
alter table public.scan_findings
  add constraint scan_findings_category_check
  check (category in ('ssl', 'headers', 'dns', 'exposure', 'tech', 'general', 'phishing', 'dependencies'));

-- github_connections (1 per owner, token encrypted)
create table public.github_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  github_user_login text,
  github_user_id integer,
  encrypted_token text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique(owner_id)
);

create index gh_conn_owner_idx on public.github_connections(owner_id);

alter table public.github_connections enable row level security;

create policy "gh_conn: own crud"
  on public.github_connections for all using (auth.uid() = owner_id);

-- sites: GitHub linking
alter table public.sites
  add column github_owner text,
  add column github_repo text,
  add column github_last_scan_at timestamptz,
  add column github_open_alerts integer default 0;

create index sites_gh_idx on public.sites(github_owner, github_repo);
