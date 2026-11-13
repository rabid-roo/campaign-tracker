-- 0009: sync current_status from the latest-dated status_update, not the last-inserted row.
-- Backfilling older evidence used to roll current_status backwards, because the
-- trigger copied whichever row was inserted last. Now it picks the newest by
-- (dated_on desc, created_at desc) so historical backfills can't regress the status.
create or replace function public.sync_promise_status()
returns trigger
language plpgsql
security definer
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
     updated_at = now()
   where id = new.promise_id;
  return new;
end;
$$;
