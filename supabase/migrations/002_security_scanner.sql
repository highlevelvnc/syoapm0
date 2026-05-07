-- BlindAI · Sprint 2 · Security Scanner
-- Tabelas: scans, scan_findings, achievements, notification_channels (Sprint 2.5)

-- ============================================================
-- scans · uma row por execução de scan completo
-- ============================================================

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed')),
  score integer check (score between 0 and 100),
  grade text check (grade in ('A+', 'A', 'B', 'C', 'D', 'F')),
  category_scores jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index scans_site_started_idx on public.scans(site_id, started_at desc);
create index scans_status_idx on public.scans(status);

alter table public.scans enable row level security;

create policy "scans: site owner reads"
  on public.scans for select using (
    exists (select 1 from public.sites
            where sites.id = scans.site_id and sites.owner_id = auth.uid())
  );

-- ============================================================
-- scan_findings · issues individuais detectados num scan
-- ============================================================

create table public.scan_findings (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  category text not null
    check (category in ('ssl', 'headers', 'dns', 'exposure', 'tech', 'general')),
  severity text not null
    check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  code text not null,
  title text not null,
  description text,
  evidence jsonb,
  recommendation text,
  created_at timestamptz not null default now()
);

create index findings_scan_idx on public.scan_findings(scan_id);
create index findings_severity_idx on public.scan_findings(severity);

alter table public.scan_findings enable row level security;

create policy "findings: site owner reads"
  on public.scan_findings for select using (
    exists (
      select 1 from public.scans s
      join public.sites si on si.id = s.site_id
      where s.id = scan_findings.scan_id and si.owner_id = auth.uid()
    )
  );

-- ============================================================
-- achievements · gamificação. unique por (site, code)
-- ============================================================

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  icon text not null default '*',
  earned_at timestamptz not null default now(),
  unique(site_id, code)
);

create index achievements_site_idx on public.achievements(site_id);

alter table public.achievements enable row level security;

create policy "achievements: site owner reads"
  on public.achievements for select using (
    exists (select 1 from public.sites
            where sites.id = achievements.site_id and sites.owner_id = auth.uid())
  );

-- ============================================================
-- notification_channels · Telegram/Email/Discord (Sprint 2.5)
-- ============================================================

create table public.notification_channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('telegram', 'email', 'discord')),
  config jsonb not null, -- { chat_id, bot_token } para telegram, { url } para discord, { email } para email
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index notification_channels_owner_idx on public.notification_channels(owner_id);

alter table public.notification_channels enable row level security;

create policy "channels: own crud"
  on public.notification_channels for all using (auth.uid() = owner_id);

-- ============================================================
-- view auxiliar: latest_scan_per_site
-- ============================================================

create or replace view public.latest_scans as
select distinct on (site_id)
  id, site_id, started_at, completed_at, status, score, grade, category_scores
from public.scans
order by site_id, started_at desc;
