-- Campaign Tracker — initial schema
-- No auth / no user login. The public site is read-only.
-- All writes happen via the owner using the service-role key (import scripts)
-- or the Supabase dashboard, which bypass RLS.
--
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.promise_status as enum (
  'not_started',
  'in_progress',
  'partially_complete',
  'completed',
  'cancelled'
);

create type public.source_type as enum ('platform', 'pdf', 'web', 'news');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  election text not null,
  year integer not null,
  description text,
  created_at timestamptz not null default now()
);

-- Unified/shared taxonomy across both parties.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0
);

create table public.promises (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  original_quote text,
  source_url text,
  source_type public.source_type not null default 'platform',
  current_status public.promise_status not null default 'not_started',
  status_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.status_updates (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid not null references public.promises(id) on delete cascade,
  status public.promise_status not null,
  summary text,
  evidence_url text,
  evidence_source text,
  dated_on date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index promises_party_id_idx on public.promises (party_id);
create index promises_category_id_idx on public.promises (category_id);
create index promises_current_status_idx on public.promises (current_status);
create index status_updates_promise_id_idx on public.status_updates (promise_id);

-- ---------------------------------------------------------------------------
-- Functions & triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger promises_set_updated_at
  before update on public.promises
  for each row execute function public.set_updated_at();

-- Keep promises.current_status in sync with the latest status update.
create or replace function public.sync_promise_status()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.promises
     set current_status = new.status,
         updated_at = now()
   where id = new.promise_id;
  return new;
end;
$$;

create trigger sync_promise_status
  after insert on public.status_updates
  for each row execute function public.sync_promise_status();

-- ---------------------------------------------------------------------------
-- Row Level Security — public read only
-- ---------------------------------------------------------------------------
alter table public.parties enable row level security;
alter table public.categories enable row level security;
alter table public.promises enable row level security;
alter table public.status_updates enable row level security;

create policy "public read parties" on public.parties
  for select using (true);
create policy "public read categories" on public.categories
  for select using (true);
create policy "public read promises" on public.promises
  for select using (true);
create policy "public read status_updates" on public.status_updates
  for select using (true);
