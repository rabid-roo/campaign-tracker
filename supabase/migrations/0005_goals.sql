-- 0005: goals (structured, trackable targets per promise)
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid not null references public.promises(id) on delete cascade,
  label text not null,
  target text,
  unit text,
  target_value numeric,
  current_value numeric,
  status text not null default 'not_started',
  source_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index goals_promise_id_idx on public.goals (promise_id);

alter table public.goals enable row level security;
create policy "public read goals" on public.goals
  for select using (true);
