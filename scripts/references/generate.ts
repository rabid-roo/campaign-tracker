import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { PARTIES } from "../itemize/config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

function findPage(
  title: string,
  quote: string,
  pages: { n: number; text: string }[],
): string | null {
  const needles = [norm(quote), norm(title)].filter((n) => n.length >= 12);

  // 1. exact substring match (punctuation-stripped)
  for (const needle of needles) {
    for (const p of pages) {
      if (p.text.includes(needle)) return `p. ${p.n}`;
    }
  }

  // 2. keyword scoring fallback
  const sig = new Set(
    `${norm(title)} ${norm(quote)}`
      .split(" ")
      .filter((w) => w.length >= 5),
  );
  if (sig.size === 0) return null;

  let best: { n: number; score: number } | null = null;
  for (const p of pages) {
    let score = 0;
    for (const w of p.text.split(" ")) {
      if (sig.has(w)) score++;
    }
    if (!best || score > best.score) best = { n: p.n, score };
  }
  if (best && best.score >= 3) return `p. ${best.n}`;
  return null;
}

function buildPages(raw: string): { n: number; text: string }[] {
  const pages: { n: number; text: string }[] = [];
  const re = /-- (\d+) of (\d+) --/g;
  const ms = [...raw.matchAll(re)];
  for (let i = 0; i < ms.length; i++) {
    const n = parseInt(ms[i][1], 10);
    const start = ms[i].index;
    const end = i + 1 < ms.length ? ms[i + 1].index : raw.length;
    pages.push({ n, text: norm(raw.slice(start, end)) });
  }
  return pages;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  let inserted = 0;
  let paged = 0;

  for (const party of PARTIES) {
    const { data: partyRow } = await supabase
      .from("parties")
      .select("id")
      .eq("slug", party.slug)
      .single();
    if (!partyRow) continue;

    const { data: promises } = await supabase
      .from("promises")
      .select("id, title, original_quote, source_url")
      .eq("party_id", partyRow.id);
    if (!promises) continue;

    const label = `${party.name} ${party.year} Platform`;

    const pages =
      party.sourceType === "pdf" ? buildPages(await readFile(party.raw, "utf8")) : [];

    for (const pr of promises) {
      await supabase
        .from("references")
        .delete()
        .eq("promise_id", pr.id)
        .eq("source_type", "platform");

      const page = pages.length
        ? findPage(pr.title, pr.original_quote ?? "", pages)
        : null;

      if (page) paged++;

      const { error } = await supabase.from("references").insert({
        promise_id: pr.id,
        label,
        url: pr.source_url ?? null,
        source_type: "platform",
        page,
        sort_order: 0,
      });
      if (error) {
        console.warn(`ref insert "${pr.title}": ${error.message}`);
        continue;
      }
      inserted++;
    }
  }

  console.log(
    `Inserted ${inserted} platform references (${paged} with a PDF page)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
