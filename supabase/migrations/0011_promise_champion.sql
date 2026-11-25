-- 0011: champion — the councillor(s) leading this promise (from the Mayor's portfolio letters).
-- Comma-separated when more than one councillor shares the lead.
alter table public.promises add column if not exists champion text;
