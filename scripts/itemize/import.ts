import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, PARTIES } from "./config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

type PromiseItem = {
  title: string;
  category: string;
  description: string;
  original_quote: string;
  source_url?: string;
  metric?: string;
  metric_source?: string;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  const supabase = createClient(url, key);

  const onlyKey = process.argv[2];

  for (const p of PARTIES) {
    const { error } = await supabase.from("parties").upsert(
      {
        name: p.name,
        slug: p.slug,
        election: p.election,
        year: p.year,
        description: p.description,
        hidden: p.hidden,
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(`party upsert ${p.slug}: ${error.message}`);
  }
  console.log("Parties upserted");

  const categories = CATEGORIES.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    sort_order: i,
  }));
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" });
  if (catErr) throw new Error(`category upsert: ${catErr.message}`);
  console.log("Categories upserted");

  const { data: parties } = await supabase.from("parties").select("id, slug");
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const partyId = new Map(parties!.map((p) => [p.slug, p.id]));
  const catId = new Map(cats!.map((c) => [c.slug, c.id]));

  let total = 0;
  for (const p of PARTIES) {
    if (onlyKey && p.key !== onlyKey) continue;

    const pid = partyId.get(p.slug);
    if (!pid) throw new Error(`no party id for ${p.slug}`);

    const items = JSON.parse(await readFile(p.out, "utf8")) as PromiseItem[];

    const rows = items.map((it) => ({
      party_id: pid,
      category_id: catId.get(it.category) ?? null,
      title: it.title,
      description: it.description,
      original_quote: it.original_quote || null,
      source_url: it.source_url ?? p.sourceUrl ?? null,
      source_type: p.sourceType,
      metric: it.metric?.trim() || null,
      metric_source: it.metric_source ?? null,
      current_status: "not_started",
    }));

    // Refresh: clear this party's existing promises before inserting.
    // NOTE: this cascades to status_updates (deletes their history too).
    const { error: delErr } = await supabase
      .from("promises")
      .delete()
      .eq("party_id", pid);
    if (delErr) throw new Error(`delete promises ${p.slug}: ${delErr.message}`);

    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("promises").insert(batch);
      if (error) throw new Error(`promise insert ${p.slug}: ${error.message}`);
    }

    total += rows.length;
    console.log(`Inserted ${rows.length} promises for ${p.slug}`);
  }

  console.log(`Done: ${total} total promises`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
