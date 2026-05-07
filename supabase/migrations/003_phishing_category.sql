-- BlindAI · Sprint 2.5 · Anti-phishing & typosquatting
-- Adiciona 'phishing' à enum de category em scan_findings.

alter table public.scan_findings
  drop constraint scan_findings_category_check;

alter table public.scan_findings
  add constraint scan_findings_category_check
    check (category in ('ssl', 'headers', 'dns', 'exposure', 'tech', 'general', 'phishing'));
