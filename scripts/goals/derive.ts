import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

function derive(goalStatuses: string[]): string {
  const total = goalStatuses.length;
  const completed = goalStatuses.filter((s) => s === "completed").length;
  const cancelled = goalStatuses.filter((s) => s === "cancelled").length;
  if (completed === total) return "completed";
  if (cancelled === total) return "cancelled";
  if (completed > 0) return "partially_complete";
  if (goalStatuses.some((s) => s === "in_progress" || s === "partially_complete")) {
    return "in_progress";
  }
  return "not_started";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const { data: promises } = await supabase
    .from("promises")
    .select("id, current_status");
  const promiseStatus = new Map((promises ?? []).map((p) => [p.id, p.current_status]));

  const { data: goals } = await supabase
    .from("goals")
    .select("id, promise_id, label, target, status, target_value, current_value");

  // Backfill migrated goals (label===target, no values, not_started) from promise status
  let backfilled = 0;
  for (const g of goals ?? []) {
    if (
      g.status === "not_started" &&
      g.target_value == null &&
      g.current_value == null &&
      g.label === g.target
    ) {
      const ps = promiseStatus.get(g.promise_id);
      if (ps && ps !== "not_started") {
        await supabase.from("goals").update({ status: ps }).eq("id", g.id);
        backfilled++;
      }
    }
  }

  const { data: goals2 } = await supabase
    .from("goals")
    .select("promise_id, status");
  const byPromise = new Map<string, string[]>();
  for (const g of goals2 ?? []) {
    if (!byPromise.has(g.promise_id)) byPromise.set(g.promise_id, []);
    byPromise.get(g.promise_id)!.push(g.status);
  }

  let changed = 0;
  for (const [promiseId, statuses] of byPromise) {
    const derived = derive(statuses);
    const cur = promiseStatus.get(promiseId);
    if (derived !== cur) {
      await supabase
        .from("promises")
        .update({ current_status: derived })
        .eq("id", promiseId);
      changed++;
    }
  }

  console.log(`Backfilled ${backfilled} goal statuses; updated ${changed} promise statuses`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
