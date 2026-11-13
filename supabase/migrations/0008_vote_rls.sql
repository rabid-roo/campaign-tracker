-- 0008: lock votes to public read-only; writes go through the service-role key.
-- The anon key is public by design, so the previous insert/update/delete policies
-- let any browser bypass the /api/vote route and rewrite or delete votes directly.
-- All writes now go through the server (service-role key), which bypasses RLS.

drop policy if exists "public update votes" on public.votes;
drop policy if exists "public delete votes" on public.votes;
drop policy if exists "public insert votes" on public.votes;

-- Aggregate a promise's vote score server-side without exposing voter rows.
-- `security invoker` (default) runs it as the caller, so RLS still applies.
create or replace function public.get_vote_score(p_id uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(vote), 0)::integer
  from public.votes
  where promise_id = p_id;
$$;
