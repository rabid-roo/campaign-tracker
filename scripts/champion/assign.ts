import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env vars");
const sb = createClient(url, key);

async function main() {
  const items = JSON.parse(
    readFileSync("data/items/newwest-2026.promises.json", "utf8"),
  ) as { title: string; champion?: string }[];

  const { data: party } = await sb
    .from("parties")
    .select("id")
    .eq("slug", "new-west-progressives")
    .single();
  if (!party) throw new Error("party not found");

  const championed = items.filter((i) => i.champion);
  let updated = 0;

  for (const it of championed) {
    const { error } = await sb
      .from("promises")
      .update({ champion: it.champion })
      .eq("party_id", party.id)
      .eq("title", it.title);
    if (error) {
      console.error("UPDATE failed:", it.title, error.message);
    } else {
      updated++;
    }
  }

  // clear champion from any NWP promise not in the list
  const titles = new Set(championed.map((i) => i.title));
  const { data: all } = await sb.from("promises").select("id, title").eq("party_id", party.id);
  const toClear = (all ?? []).filter((p) => !titles.has(p.title)).map((p) => p.id);
  if (toClear.length > 0) {
    await sb.from("promises").update({ champion: null }).in("id", toClear);
  }

  console.log(`Assigned champion to ${updated} promises`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
