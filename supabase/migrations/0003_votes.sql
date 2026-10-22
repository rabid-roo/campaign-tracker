-- 0003: anonymous accuracy votes (thumbs up/down)
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid not null references public.promises(id) on delete cascade,
  voter_id text not null,
  vote smallint not null check (vote in (1, -1)),
  created_at timestamptz not null default now(),
  unique (promise_id, voter_id)
);

create index votes_promise_id_idx on public.votes (promise_id);

alter table public.votes enable row level security;

create policy "public read votes" on public.votes
  for select using (true);
create policy "public insert votes" on public.votes
  for insert with check (true);
create policy "public update votes" on public.votes
  for update using (true) with check (true);
create policy "public delete votes" on public.votes
  for delete using (true);
