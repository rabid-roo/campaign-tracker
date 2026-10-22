import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { PARTIES } from "./config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const BATCH = 20;

type P = {
  title: string;
  category: string;
  description: string;
  original_quote: string;
  [k: string]: unknown;
};

const SYSTEM = `You are cleaning up data for a campaign promise tracker.

For each promise below, write a CONCISE plain-English summary (1-2 sentences) of what the party promised. The summary must be a FRESH rewrite — not a copy or near-copy of the original quote. Be specific and factual; do not add facts not implied by the input.

Return STRICT JSON only, in this shape:
{"items":[{"title":"<exact title>","description":"<concise summary>"}]}`;

async function callDeepSeek(user: string): Promise<{ title: string; description: string }[]> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 8000,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as { choices: { message: { content: string } }[] };
      const content = data.choices[0].message.content;
      const obj = JSON.parse(content);
      return obj.items ?? [];
    }

    const status = res.status;
    if (status !== 429 && status < 500) {
      const body = await res.text();
      throw new Error(`DeepSeek ${status}: ${body.slice(0, 300)}`);
    }
    await new Promise((r) => setTimeout(r, attempt * 2000));
  }
  throw new Error("DeepSeek failed after retries");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  for (const party of PARTIES) {
    const items = JSON.parse(await readFile(party.out, "utf8")) as P[];
    const updated = new Map<string, string>();

    console.log(`\n${party.name}: rewriting ${items.length} descriptions...`);
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
      const user = batch.map((p) => `${p.title} ||| ${p.original_quote}`).join("\n");
      const res = await callDeepSeek(user);
      for (const r of res) updated.set(r.title, r.description);
      console.log(`  batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(items.length / BATCH)}`);
      await new Promise((r) => setTimeout(r, 300));
    }

    let applied = 0;
    for (const p of items) {
      const d = updated.get(p.title);
      if (d && d.trim()) {
        p.description = d.trim();
        applied++;
      }
    }

    await writeFile(party.out, JSON.stringify(items, null, 2), "utf8");
    console.log(`${party.key}: updated ${applied}/${items.length} descriptions in JSON`);

    // Sync descriptions to the DB (surgical UPDATE — no delete/cascade)
    const { data: partyRow } = await supabase
      .from("parties")
      .select("id")
      .eq("slug", party.slug)
      .single();
    if (partyRow) {
      const { data: rows } = await supabase
        .from("promises")
        .select("id, title")
        .eq("party_id", partyRow.id);
      const byTitle = new Map((rows ?? []).map((r) => [r.title, r.id]));
      let dbUpdated = 0;
      for (const p of items) {
        const id = byTitle.get(p.title);
        if (id) {
          await supabase.from("promises").update({ description: p.description }).eq("id", id);
          dbUpdated++;
        }
      }
      console.log(`${party.key}: synced ${dbUpdated} descriptions to DB`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
