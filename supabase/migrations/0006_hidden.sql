-- 0006: allow hiding parties from the public site
alter table public.parties add column if not exists hidden boolean not null default false;
