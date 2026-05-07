-- BlindAI · schema inicial
-- Multi-tenant via Row Level Security: owner_id = auth.uid()
-- Histórico completo de consents (cada mudança = nova row) — RGPD exige prova de quando foi dado.

-- ============================================================
-- profiles · estende auth.users
-- ============================================================

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own read"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: own update"
  on public.profiles for update using (auth.uid() = id);

-- auto-cria profile quando user faz signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- sites · um por domínio por owner
-- ============================================================

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  domain text not null,
  name text not null,
  theme_color text not null default '#00FF41',
  lang_default text not null default 'pt-PT' check (lang_default in ('pt-PT', 'pt-BR', 'en')),
  badge_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(owner_id, domain)
);

create index sites_owner_idx on public.sites(owner_id);
create index sites_domain_idx on public.sites(domain);

alter table public.sites enable row level security;

create policy "sites: own read"
  on public.sites for select using (auth.uid() = owner_id);
create policy "sites: own insert"
  on public.sites for insert with check (auth.uid() = owner_id);
create policy "sites: own update"
  on public.sites for update using (auth.uid() = owner_id);
create policy "sites: own delete"
  on public.sites for delete using (auth.uid() = owner_id);

-- ============================================================
-- consents · histórico completo (auditoria legal RGPD)
-- ============================================================

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  anon_uid text not null,
  necessary boolean not null default true,
  functional boolean not null default false,
  analytics boolean not null default false,
  marketing boolean not null default false,
  action text not null check (action in ('accept_all', 'reject_all', 'custom', 'update')),
  ip_hash text,
  ua text,
  lang text,
  page_url text,
  banner_version text not null default 'v1',
  created_at timestamptz not null default now()
);

create index consents_site_created_idx on public.consents(site_id, created_at desc);
create index consents_anon_idx on public.consents(site_id, anon_uid, created_at desc);

alter table public.consents enable row level security;

-- Inserts vêm via service role (API endpoint /api/v1/consent), não cliente browser.
-- Reads: dono do site lê os seus consents.
create policy "consents: site owner reads"
  on public.consents for select using (
    exists (
      select 1 from public.sites
      where sites.id = consents.site_id
        and sites.owner_id = auth.uid()
    )
  );
