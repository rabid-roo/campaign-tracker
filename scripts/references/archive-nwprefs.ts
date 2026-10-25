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

  const { data: party } = await supabase
    .from("parties")
    .select("id")
    .eq("slug", "new-west-progressives")
    .single();
  if (!party) throw new Error("NWP party not found");

  const { data: promises } = await supabase
    .from("promises")
    .select("id, source_url")
    .eq("party_id", party.id);
  if (!promises) return;

  let noted = 0;
  let archived = 0;

  for (const p of promises) {
    const { data: refs } = await supabase
      .from("references")
      .select("id")
      .eq("promise_id", p.id)
      .eq("source_type", "platform");

    for (const r of refs ?? []) {
      await supabase
        .from("references")
        .update({ note: "Captured October 2026" })
        .eq("id", r.id);
      noted++;
    }

    if (p.source_url && p.source_url.includes("nwprogress.ca")) {
      const wayback = `https://web.archive.org/web/*/${p.source_url}`;
      const { data: existing } = await supabase
        .from("references")
        .select("id")
        .eq("promise_id", p.id)
        .eq("source_type", "archive");
      if (!existing || existing.length === 0) {
        await supabase.from("references").insert({
          promise_id: p.id,
          label: "Wayback Machine archive",
          url: wayback,
          source_type: "archive",
          sort_order: 1,
        });
        archived++;
      }
    }
  }

  console.log(`Stamped ${noted} platform refs; added ${archived} Wayback refs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
