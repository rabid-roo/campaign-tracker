import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const { data: promises } = await supabase
    .from("promises")
    .select("id, metric, metric_source")
    .not("metric", "is", null);

  let migrated = 0;
  let skipped = 0;

  for (const p of promises ?? []) {
    const { data: existing } = await supabase
      .from("goals")
      .select("id")
      .eq("promise_id", p.id);
    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("goals").insert({
      promise_id: p.id,
      label: p.metric,
      target: p.metric,
      source_url: null,
      sort_order: 0,
    });
    if (error) {
      console.warn(`ERROR "${p.metric}": ${error.message}`);
      continue;
    }
    migrated++;
  }

  console.log(`Migrated ${migrated} metrics to goals (${skipped} already present)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
