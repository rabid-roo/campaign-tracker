-- 0010: reviewed_on — the date a promise's status was last checked against sources.
--
-- Distinct from the two timestamps that already exist:
--   created_at  is rewritten by `npm run import` (delete + re-insert),
--   updated_at  moves on any UPDATE, including derive.ts goal rollups.
-- Neither records that a person looked at the promise.
--
-- NOTE: `npm run import` re-inserts promises without reviewed_on, so rerun the
-- backfill below after any reimport — same caveat as `promises.tag`.

alter table public.promises add column if not exists reviewed_on date;

-- Backfill: a status update row means someone checked the promise when the row
-- was recorded. `created_at` is that moment; `dated_on` is the event's date and
-- can predate the promise itself (a 2024 platform citing a 2023 decision).
update public.promises p
   set reviewed_on = u.latest
  from (
    select promise_id,
           max(created_at::date) as latest
      from public.status_updates
     group by promise_id
  ) u
 where u.promise_id = p.id
   and (p.reviewed_on is null or p.reviewed_on < u.latest);

-- Stamp the review date inside the existing status-sync trigger (0009) rather
-- than adding a second AFTER INSERT trigger that would issue its own UPDATE.
-- Replacing the function body updates the trigger already attached to it.
create or replace function public.sync_promise_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.promises
     set current_status = (
       select status
       from public.status_updates
       where promise_id = new.promise_id
       order by dated_on desc nulls last, created_at desc
       limit 1
     ),
     reviewed_on = greatest(
       coalesce(reviewed_on, '-infinity'::date),
       new.created_at::date
     ),
     updated_at = now()
   where id = new.promise_id;
  return new;
end;
$$;
