-- 0002: metric tracking on promises
-- Captures the measurable target ("45,000 health workers", "30% land by 2030")
-- and where that metric is published (StatsCan, CMHC, BC Gov dashboard, etc.).
alter table public.promises add column if not exists metric text;
alter table public.promises add column if not exists metric_source text;
