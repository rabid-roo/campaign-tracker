import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { CATEGORIES, PARTIES, type Party } from "./config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may be missing in CI; env vars can come from the shell instead
}

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const MAX_CHUNK = 12000;

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug).join(", ");

const SYSTEM_PROMPT = `You extract campaign promises from political platform documents.

A "promise" is ONE distinct, top-level commitment a party is making. In these documents each
commitment is usually introduced by a heading or headline (for example "Make Heritage
Preservation Practical" or "Freeze ICBC rates for three years"), followed by supporting
bullets and paragraphs that elaborate the SAME commitment.

Given a section of a platform:
- Identify each distinct top-level promise (typically one per heading/headline).
- CONSOLIDATE all its supporting bullets, sub-points and clauses into ONE cohesive description.
- Do NOT create a separate item for each bullet or sub-clause.

Return STRICT JSON only, in exactly this shape:
{"promises":[{"title":"short headline-style title","category":"<slug>","description":"1-3 sentence summary consolidating everything promised under this commitment","original_quote":"verbatim heading or the key sentence(s) stating the promise","metric":"a short quantifiable target or deadline if the promise has one (e.g. '30% land by 2030', '45,000 workers', 'double EV chargers'), otherwise empty string"}]}

Category must be exactly one of: ${CATEGORY_SLUGS}

Rules:
- Merge related sub-actions into their parent promise; only split into separate promises for
  clearly independent policy areas.
- Prefer the document's own heading text as the title.
- Do not invent promises that are not in the text.
- Exclude past accomplishments ("we already did/are doing X") — only forward-looking promises.
- Keep original_quote concise and verbatim.
- Set "metric" to a concrete target only when the text states a number, percentage, deadline or
  measurable goal; otherwise use empty string.`;

type PromiseItem = {
  title: string;
  category: string;
  description: string;
  original_quote: string;
  source_url?: string;
  metric?: string;
};

type Chunk = { text: string; sourceUrl?: string };

function chunkParagraphs(text: string, max = MAX_CHUNK): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paragraphs) {
    if (cur && (cur + "\n\n" + p).length > max) {
      chunks.push(cur);
      cur = p;
    } else {
      cur = cur ? cur + "\n\n" + p : p;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

// NWP raw file uses "========== PAGE N :: URL ==========" separators.
function splitNwp(raw: string): Chunk[] {
  const out: Chunk[] = [];
  const re = /\n?========== PAGE \d+ :: (.+) ==========\n/g;
  const matches = [...raw.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const url = matches[i][1].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
    const text = raw.slice(start, end).trim();
    if (text) out.push({ text, sourceUrl: url });
  }
  return out;
}

function buildChunks(party: Party, raw: string): Chunk[] {
  if (party.sourceType === "web" && /PAGE \d+ ::/.test(raw)) {
    const chunks: Chunk[] = [];
    for (const seg of splitNwp(raw)) {
      for (const c of chunkParagraphs(seg.text)) {
        chunks.push({ text: c, sourceUrl: seg.sourceUrl });
      }
    }
    return chunks;
  }
  return chunkParagraphs(raw).map((text) => ({
    text,
    sourceUrl: party.sourceUrl,
  }));
}

async function callDeepSeek(user: string): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: user },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 8000,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      return data.choices[0].message.content;
    }

    const status = res.status;
    const body = await res.text();
    if (status !== 429 && status < 500) {
      throw new Error(`DeepSeek API ${status}: ${body.slice(0, 400)}`);
    }
    console.warn(`  DeepSeek ${status}, retrying (${attempt})...`);
    await new Promise((r) => setTimeout(r, attempt * 2500));
  }
  throw new Error("DeepSeek API failed after retries");
}

function parsePromises(content: string): PromiseItem[] {
  try {
    const obj = JSON.parse(content) as { promises?: PromiseItem[] };
    return obj.promises ?? [];
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) {
      const obj = JSON.parse(m[0]) as { promises?: PromiseItem[] };
      return obj.promises ?? [];
    }
    throw new Error("Could not parse JSON from DeepSeek response");
  }
}

function normalize(item: PromiseItem): PromiseItem {
  const category = CATEGORY_SLUGS.split(", ").includes(item.category)
    ? item.category
    : "other";
  return {
    title: (item.title ?? "").trim(),
    category,
    description: (item.description ?? "").trim(),
    original_quote: (item.original_quote ?? "").trim(),
    metric: (item.metric ?? "").trim(),
  };
}

function dedupe(items: PromiseItem[]): PromiseItem[] {
  const seen = new Set<string>();
  const out: PromiseItem[] = [];
  for (const it of items) {
    const key = it.title.toLowerCase().replace(/\s+/g, " ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

async function main() {
  const key = process.argv[2];
  const limitArg = process.argv[3];

  const party = PARTIES.find((p) => p.key === key);
  if (!party) {
    console.error(`Unknown party key: ${key}. Valid: ${PARTIES.map((p) => p.key).join(", ")}`);
    process.exit(1);
  }

  const raw = await readFile(party.raw, "utf8");
  let chunks = buildChunks(party, raw);

  if (limitArg) {
    const n = parseInt(limitArg, 10);
    chunks = chunks.slice(0, n);
    console.log(`LIMIT: processing only first ${n} chunk(s)`);
  }

  console.log(`Itemizing ${party.name}: ${chunks.length} chunk(s)`);

  const all: PromiseItem[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    console.log(`  chunk ${i + 1}/${chunks.length} (${c.text.length} chars)...`);
    const user = c.sourceUrl
      ? `SOURCE: ${c.sourceUrl}\n\nTEXT:\n${c.text}`
      : `TEXT:\n${c.text}`;
    const content = await callDeepSeek(user);
    const items = parsePromises(content).map(normalize).map((it) => ({
      ...it,
      source_url: c.sourceUrl,
    }));
    all.push(...items);
    console.log(`    -> ${items.length} promise(s)`);
    await new Promise((r) => setTimeout(r, 500));
  }

  const final = dedupe(all);
  await mkdir(path.dirname(party.out), { recursive: true });
  await writeFile(party.out, JSON.stringify(final, null, 2), "utf8");
  console.log(`\nWrote ${final.length} promises to ${party.out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
