import { readFile } from "node:fs/promises";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PARTIES } from "../itemize/config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

type ManualGoal = {
  party: string;
  promise: string;
  label: string;
  target?: string;
  unit?: string;
  target_value?: number;
  current_value?: number;
  status?: string;
  source_url?: string;
  sort_order?: number;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolvePromiseId(
  supabase: SupabaseClient,
  partySlug: string,
  promise: string,
): Promise<string | null> {
  const { data: party } = await supabase
    .from("parties")
    .select("id")
    .eq("slug", partySlug)
    .single();
  if (!party) return null;

  if (UUID_RE.test(promise)) {
    const { data } = await supabase
      .from("promises")
      .select("id")
      .eq("id", promise)
      .eq("party_id", party.id)
      .single();
    return data?.id ?? null;
  }

  const { data: exact } = await supabase
    .from("promises")
    .select("id, title")
    .eq("party_id", party.id)
    .ilike("title", promise);
  if (exact && exact.length === 1) return exact[0].id;

  const { data: fuzzy } = await supabase
    .from("promises")
    .select("id, title")
    .eq("party_id", party.id)
    .ilike("title", `%${promise}%`);
  if (fuzzy && fuzzy.length === 1) return fuzzy[0].id;
  if (fuzzy && fuzzy.length > 1) {
    console.warn(`  ${fuzzy.length} matches for "${promise}"`);
    return null;
  }
  return null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const goals = JSON.parse(
    await readFile("data/goals/manual.json", "utf8"),
  ) as ManualGoal[];

  if (goals.length === 0) {
    console.log("No manual goals in data/goals/manual.json");
    return;
  }

  const validParties = new Set(PARTIES.map((p) => p.slug));
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const g of goals) {
    if (!validParties.has(g.party)) {
      console.warn(`SKIP unknown party "${g.party}"`);
      failed++;
      continue;
    }
    const pid = await resolvePromiseId(supabase, g.party, g.promise);
    if (!pid) {
      console.warn(`SKIP promise not found: "${g.promise}"`);
      failed++;
      continue;
    }
    const { data: existing } = await supabase
      .from("goals")
      .select("label")
      .eq("promise_id", pid);
    const dup = (existing ?? []).some((row) => row.label === g.label);
    if (dup) {
      skipped++;
      continue;
    }
    const { error } = await supabase.from("goals").insert({
      promise_id: pid,
      label: g.label,
      target: g.target ?? null,
      unit: g.unit ?? null,
      target_value: g.target_value ?? null,
      current_value: g.current_value ?? null,
      status: g.status ?? "not_started",
      source_url: g.source_url ?? null,
      sort_order: g.sort_order ?? 0,
    });
    if (error) {
      console.warn(`ERROR "${g.label}": ${error.message}`);
      failed++;
      continue;
    }
    inserted++;
  }

  console.log(`Done: ${inserted} inserted, ${skipped} skipped, ${failed} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
