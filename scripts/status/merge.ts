import { readFile, writeFile } from "node:fs/promises";

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error('Usage: npm run status:merge -- <agent-output.json>');
    process.exit(1);
  }

  const incoming = JSON.parse(await readFile(src, "utf8")) as Record<string, unknown>[];
  const existing = JSON.parse(
    await readFile("data/status/updates.json", "utf8"),
  ) as Record<string, unknown>[];

  const key = (e: Record<string, unknown>) =>
    `${e.party}|${e.promise}|${e.status}|${e.summary}`;
  const seen = new Set(existing.map(key));

  let added = 0;
  for (const e of incoming) {
    if (!e.party || !e.promise || !e.status) continue;
    if (seen.has(key(e))) continue;
    seen.add(key(e));
    existing.push(e);
    added++;
  }

  await writeFile(
    "data/status/updates.json",
    JSON.stringify(existing, null, 2),
    "utf8",
  );
  console.log(
    `Merged ${added} new entries (${existing.length} total). Next: npm run status:import`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
