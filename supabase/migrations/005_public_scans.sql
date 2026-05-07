-- BlindAI · Sprint 5 · Public scan API
-- Permite testar qualquer domínio sem signup. Cache 24h por domain. Rate limit por IP.

create table public.public_scans (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  score integer check (score between 0 and 100),
  grade text check (grade in ('A+', 'A', 'B', 'C', 'D', 'F')),
  category_scores jsonb,
  findings_summary jsonb,
  total_findings integer not null default 0,
  critical_findings integer not null default 0,
  high_findings integer not null default 0,
  medium_findings integer not null default 0,
  low_findings integer not null default 0,
  detected_tech jsonb,
  ip_hash text,
  ua text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index public_scans_domain_idx on public.public_scans(domain, created_at desc);
create index public_scans_ip_idx on public.public_scans(ip_hash, created_at desc);
create index public_scans_created_idx on public.public_scans(created_at desc);

alter table public.public_scans enable row level security;

create policy "public_scans: anyone reads" on public.public_scans for select using (true);
