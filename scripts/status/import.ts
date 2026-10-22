import { readFile } from "node:fs/promises";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PARTIES } from "../itemize/config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const STATUS_VALUES = [
  "not_started",
  "in_progress",
  "partially_complete",
  "completed",
  "cancelled",
] as const;

type Update = {
  party: string;
  promise: string;
  status: string;
  summary?: string;
  evidence_url?: string;
  evidence_source?: string;
  dated_on?: string;
};

type Supabase = SupabaseClient;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolvePromiseId(
  supabase: Supabase,
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
  if (exact && exact.length > 1) {
    console.warn(`  multiple exact matches for "${promise}"`);
    return null;
  }

  const { data: fuzzy } = await supabase
    .from("promises")
    .select("id, title")
    .eq("party_id", party.id)
    .ilike("title", `%${promise}%`);
  if (fuzzy && fuzzy.length === 1) return fuzzy[0].id;
  if (fuzzy && fuzzy.length > 1) {
    console.warn(
      `  ${fuzzy.length} matches for "${promise}": ${fuzzy
        .map((f) => f.title)
        .join(" | ")}`,
    );
    return null;
  }

  return null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const updates = JSON.parse(
    await readFile("data/status/updates.json", "utf8"),
  ) as Update[];

  if (updates.length === 0) {
    console.log("No entries in data/status/updates.json");
    return;
  }

  const sorted = [...updates].sort((a, b) =>
    (a.dated_on ?? "").localeCompare(b.dated_on ?? ""),
  );
  const validParties = new Set(PARTIES.map((p) => p.slug));

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const u of sorted) {
    const label = u.promise;

    if (!STATUS_VALUES.includes(u.status as (typeof STATUS_VALUES)[number])) {
      console.warn(`SKIP invalid status "${u.status}" for "${label}"`);
      failed++;
      continue;
    }
    if (!validParties.has(u.party)) {
      console.warn(`SKIP unknown party "${u.party}" for "${label}"`);
      failed++;
      continue;
    }

    const promiseId = await resolvePromiseId(supabase, u.party, u.promise);
    if (!promiseId) {
      console.warn(`SKIP promise not found: "${label}"`);
      failed++;
      continue;
    }

    const { data: existing } = await supabase
      .from("status_updates")
      .select("status, summary, evidence_url, evidence_source, dated_on")
      .eq("promise_id", promiseId);

    const isDup = (existing ?? []).some(
      (row) =>
        row.status === u.status &&
        (row.summary ?? null) === (u.summary ?? null) &&
        (row.evidence_url ?? null) === (u.evidence_url ?? null) &&
        (row.evidence_source ?? null) === (u.evidence_source ?? null) &&
        (row.dated_on ?? null) === (u.dated_on ?? null),
    );
    if (isDup) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("status_updates").insert({
      promise_id: promiseId,
      status: u.status,
      summary: u.summary ?? null,
      evidence_url: u.evidence_url ?? null,
      evidence_source: u.evidence_source ?? null,
      dated_on: u.dated_on ?? null,
    });
    if (error) {
      console.warn(`ERROR "${label}": ${error.message}`);
      failed++;
      continue;
    }
    inserted++;
  }

  console.log(
    `Done: ${inserted} inserted, ${skipped} skipped (duplicates), ${failed} failed`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
