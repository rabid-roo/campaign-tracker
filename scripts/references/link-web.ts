import { readFile } from "node:fs/promises";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PARTIES } from "../itemize/config";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

type WebLink = { party: string; promise: string; label: string; url: string };

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

async function checkWayback(url: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as {
      archived_snapshots?: { closest?: { available?: boolean } };
    };
    return data.archived_snapshots?.closest?.available === true;
  } catch {
    return false;
  }
}

async function triggerArchive(url: string): Promise<string> {
  try {
    const res = await fetch(`https://web.archive.org/save/${url}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    return `${res.status} ${res.statusText}`;
  } catch (e) {
    return `error: ${(e as Error).message}`;
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const links = JSON.parse(
    await readFile("data/references/web-links.json", "utf8"),
  ) as WebLink[];

  if (links.length === 0) {
    console.log("No web links in data/references/web-links.json");
    return;
  }

  const validParties = new Set(PARTIES.map((p) => p.slug));
  const uniqueUrls = [...new Set(links.map((l) => l.url))];

  // 1. Wayback Machine: check availability + trigger "Save Page Now" if missing
  console.log("Wayback Machine:");
  for (const u of uniqueUrls) {
    const available = await checkWayback(u);
    if (available) {
      console.log(`  ✓ archived   ${u}`);
    } else {
      const r = await triggerArchive(u);
      console.log(`  → not archived (${r}) — submitted: ${u}`);
      // be polite to archive.org; "Save Page Now" is rate-limited for anonymous use
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // 2. Add web + wayback references to the mapped promises
  let webAdded = 0;
  let waybackAdded = 0;
  let failed = 0;

  for (const l of links) {
    if (!validParties.has(l.party)) {
      console.warn(`SKIP unknown party "${l.party}"`);
      failed++;
      continue;
    }
    const pid = await resolvePromiseId(supabase, l.party, l.promise);
    if (!pid) {
      console.warn(`SKIP promise not found: "${l.promise}"`);
      failed++;
      continue;
    }

    const { data: existingWeb } = await supabase
      .from("references")
      .select("id")
      .eq("promise_id", pid)
      .eq("url", l.url);
    if (!existingWeb || existingWeb.length === 0) {
      const { error } = await supabase.from("references").insert({
        promise_id: pid,
        label: l.label,
        url: l.url,
        source_type: "web",
      });
      if (error) {
        console.warn(`ERROR web "${l.label}": ${error.message}`);
        failed++;
      } else {
        webAdded++;
      }
    }

    const waybackUrl = `https://web.archive.org/web/*/${l.url}`;
    const { data: existingArch } = await supabase
      .from("references")
      .select("id")
      .eq("promise_id", pid)
      .eq("url", waybackUrl);
    if (!existingArch || existingArch.length === 0) {
      const { error } = await supabase
        .from("references")
        .insert({
          promise_id: pid,
          label: "Wayback Machine archive",
          url: waybackUrl,
          source_type: "archive",
        });
      if (error) {
        console.warn(`ERROR wayback "${l.label}": ${error.message}`);
        failed++;
      } else {
        waybackAdded++;
      }
    }
  }

  console.log(
    `\nDone: ${webAdded} web refs, ${waybackAdded} wayback refs, ${failed} failed`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
