import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const OLD =
  "https://www.bcndp.ca/sites/default/files/bcndp_anactionplanforyou_final_final_final_final_web_0.pdf";
const NEW = "https://campaign-tracker-jet-zeta.vercel.app/bcndp-2024-platform.pdf";

async function main() {
  // 1. Update the itemized JSON
  const path = "data/items/bcndp-2024.promises.json";
  const raw = await readFile(path, "utf8");
  await writeFile(path, raw.split(OLD).join(NEW), "utf8");
  console.log("JSON source_url updated");

  // 2. Update the DB
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const { error: pErr } = await supabase
    .from("promises")
    .update({ source_url: NEW })
    .eq("source_url", OLD);
  console.log("promises.source_url:", pErr ? `ERROR ${pErr.message}` : "updated");

  const { error: rErr } = await supabase
    .from("references")
    .update({ url: NEW })
    .eq("url", OLD);
  console.log("references.url:", rErr ? `ERROR ${rErr.message}` : "updated");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
