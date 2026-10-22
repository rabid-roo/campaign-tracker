-- 0004: references (multiple cited sources per promise)
create table public.references (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid not null references public.promises(id) on delete cascade,
  label text not null,
  url text,
  source_type text not null default 'platform',
  page text,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index references_promise_id_idx on public.references (promise_id);

alter table public.references enable row level security;
create policy "public read references" on public.references
  for select using (true);
