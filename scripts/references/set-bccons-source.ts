import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const OFFICIAL =
  "https://conservativebc.ca/wp-content/uploads/2026/10/20261016_BCC_Platform2026_8-5x11-Draft-18_compressed.pdf";
const OUR = "https://campaign-tracker-jet-zeta.vercel.app/bc-conservatives-2026.pdf";
const CAPTURED = "Downloaded October 21, 2026";

async function main() {
  // 1. Update the itemized JSON source_url
  const path = "data/items/bc-conservatives-2026.promises.json";
  const raw = await readFile(path, "utf8");
  await writeFile(path, raw.split(OUR).join(OFFICIAL), "utf8");
  console.log("JSON source_url updated");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  // 2. promises.source_url -> official
  const { data: promises } = await supabase
    .from("promises")
    .select("id")
    .eq("source_url", OUR);
  const { error: pErr } = await supabase
    .from("promises")
    .update({ source_url: OFFICIAL })
    .eq("source_url", OUR);
  console.log(
    "promises.source_url:",
    pErr ? `ERROR ${pErr.message}` : `updated ${promises?.length ?? 0}`,
  );

  // 3. platform references -> official (keep page)
  const { error: rErr } = await supabase
    .from("references")
    .update({ url: OFFICIAL })
    .eq("url", OUR)
    .eq("source_type", "platform");
  console.log("platform refs:", rErr ? `ERROR ${rErr.message}` : "updated");

  // 4. add a backup reference pointing at our hosted copy
  const { data: party } = await supabase
    .from("parties")
    .select("id")
    .eq("slug", "bc-conservatives")
    .single();
  if (!party) throw new Error("BC Conservatives party not found");
  const { data: allPromises } = await supabase
    .from("promises")
    .select("id")
    .eq("party_id", party.id);

  let backups = 0;
  for (const p of allPromises ?? []) {
    const { data: existing } = await supabase
      .from("references")
      .select("id")
      .eq("promise_id", p.id)
      .eq("source_type", "backup");
    if (existing && existing.length > 0) continue;

    const { error } = await supabase.from("references").insert({
      promise_id: p.id,
      label: "Backup copy",
      url: OUR,
      source_type: "backup",
      note: CAPTURED,
      sort_order: 1,
    });
    if (!error) backups++;
  }

  console.log(`Added ${backups} backup references`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
