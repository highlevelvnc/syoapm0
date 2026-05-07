-- BlindAI · Sprint 8 · tags por site + cleanup function (free tier hygiene)

-- ============================================================
-- tags · array em sites para agrupar por cliente / sector / tier
-- ============================================================

alter table public.sites
  add column tags text[] not null default '{}'::text[];

create index sites_tags_idx on public.sites using gin(tags);

-- ============================================================
-- cleanup_old_data · auto-purge para sobrevivência no free tier
-- ============================================================

create or replace function public.cleanup_old_data()
returns table(
  scans_deleted integer,
  public_scans_deleted integer,
  consents_anonymized integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_scans_deleted integer;
  v_public_scans_deleted integer;
  v_consents_anonymized integer;
begin
  -- 1. scans completos > 90 dias (e findings em cascade)
  -- Mantemos pelo menos os 5 mais recentes por site para preservar history chart.
  with old_scans as (
    select s.id from public.scans s
    where s.completed_at < now() - interval '90 days'
      and s.id not in (
        select id from (
          select id, site_id,
            row_number() over (partition by site_id order by started_at desc) as rn
          from public.scans
          where status = 'completed'
        ) ranked
        where rn <= 5
      )
  )
  delete from public.scans where id in (select id from old_scans);
  get diagnostics v_scans_deleted = row_count;

  -- 2. public_scans > 30 dias (são cache puro, não auditoria)
  delete from public.public_scans
  where created_at < now() - interval '30 days';
  get diagnostics v_public_scans_deleted = row_count;

  -- 3. consents > 12 meses: anonymize (RGPD permite, retention legal)
  -- Apaga ip_hash, ua, page_url, anon_uid. Mantém site_id, action, choices, lang, ts
  -- para audit aggregate (analytics).
  update public.consents
  set ip_hash = null,
      ua = null,
      page_url = null,
      anon_uid = 'anonymized'
  where created_at < now() - interval '12 months'
    and (ip_hash is not null or ua is not null);
  get diagnostics v_consents_anonymized = row_count;

  return query select v_scans_deleted, v_public_scans_deleted, v_consents_anonymized;
end;
$$;

-- ============================================================
-- db_size_estimate · query para mostrar uso na UI
-- ============================================================

create or replace function public.db_size_estimate()
returns table(
  table_name text,
  row_count bigint,
  est_bytes bigint
)
language sql
security definer
set search_path = public
as $$
  select 'scans'::text, count(*)::bigint, count(*)::bigint * 200 from scans
  union all
  select 'scan_findings'::text, count(*)::bigint, count(*)::bigint * 500 from scan_findings
  union all
  select 'consents'::text, count(*)::bigint, count(*)::bigint * 250 from consents
  union all
  select 'public_scans'::text, count(*)::bigint, count(*)::bigint * 1000 from public_scans
  union all
  select 'sites'::text, count(*)::bigint, count(*)::bigint * 300 from sites
  union all
  select 'achievements'::text, count(*)::bigint, count(*)::bigint * 100 from achievements
  union all
  select 'cloudflare_actions'::text, count(*)::bigint, count(*)::bigint * 200 from cloudflare_actions;
$$;
