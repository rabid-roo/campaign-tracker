import { readFile } from "node:fs/promises";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PARTIES } from "../itemize/config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

type ManualRef = {
  party: string;
  promise: string;
  label: string;
  url?: string;
  source_type?: string;
  page?: string;
  note?: string;
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

  const refs = JSON.parse(
    await readFile("data/references/manual.json", "utf8"),
  ) as ManualRef[];

  if (refs.length === 0) {
    console.log("No manual references in data/references/manual.json");
    return;
  }

  const validParties = new Set(PARTIES.map((p) => p.slug));
  let inserted = 0;
  let failed = 0;

  for (const r of refs) {
    if (!validParties.has(r.party)) {
      console.warn(`SKIP unknown party "${r.party}"`);
      failed++;
      continue;
    }
    const pid = await resolvePromiseId(supabase, r.party, r.promise);
    if (!pid) {
      console.warn(`SKIP promise not found: "${r.promise}"`);
      failed++;
      continue;
    }
    const { error } = await supabase.from("references").insert({
      promise_id: pid,
      label: r.label,
      url: r.url ?? null,
      source_type: r.source_type ?? "other",
      page: r.page ?? null,
      note: r.note ?? null,
    });
    if (error) {
      console.warn(`ERROR "${r.label}": ${error.message}`);
      failed++;
      continue;
    }
    inserted++;
  }

  console.log(`Done: ${inserted} inserted, ${failed} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
