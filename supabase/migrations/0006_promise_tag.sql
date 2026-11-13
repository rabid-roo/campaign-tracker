-- 0006: tag (e.g. membership in a named plan such as the 100-day plan)
alter table public.promises add column if not exists tag text;
