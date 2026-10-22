import { createClient } from "@supabase/supabase-js";
import { PARTIES } from "../itemize/config";

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

  const filter = process.argv[2];

  for (const p of PARTIES) {
    if (filter && p.slug !== filter) continue;

    const { data: party } = await supabase
      .from("parties")
      .select("id")
      .eq("slug", p.slug)
      .single();
    if (!party) continue;

    const { data: promises } = await supabase
      .from("promises")
      .select("id, title, current_status")
      .eq("party_id", party.id)
      .order("title", { ascending: true });

    console.log(
      `\n=== ${p.name} (${p.slug}) — ${promises?.length ?? 0} promises ===`,
    );
    for (const pr of promises ?? []) {
      console.log(`${pr.id}  [${pr.current_status}]  ${pr.title}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
