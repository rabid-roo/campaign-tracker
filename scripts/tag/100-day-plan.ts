import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env vars");
const sb = createClient(url, key);

const TITLES = [
  "Eliminate the Electricity Surtax",
  "Reduce External Consultant Spending",
  "Freeze mayor, council and senior executive pay",
  "Launch an independent core services review",
  "Cancel the 'Sue Big Oil' Initiative",
  "Place at least 12 new Community Enforcement and Safety Officers",
  "Enhance street cleaning and add 100 new waste and recycling bins",
  "Give residents their voice back",
  "Make New West the Royal City again",
  "Get the waterfront pier rebuild moving",
  "Strengthen City\u2013School District Collaboration",
  "Modernize City Hall",
  "Create the Columbia District",
  "Eliminate Patio Permit Fees and Expand Patio Seating",
  "Fix New Westminster's worst traffic bottlenecks",
  "Advocate to reduce train whistles",
  "Bring Political Leadership Back to Rail Issues",
];

async function main() {
  const { data: party } = await sb.from("parties").select("id").eq("slug", "new-west-progressives").single();
  if (!party) throw new Error("party not found");

  // tag the 17
  const { error: setErr } = await sb
    .from("promises")
    .update({ tag: "100-Day Plan" })
    .eq("party_id", party.id)
    .in("title", TITLES);
  if (setErr) {
    console.error("tag update failed (run migration first?):", setErr.message);
    return;
  }

  // clear tag from any others
  const { data: all } = await sb.from("promises").select("id, title").eq("party_id", party.id);
  const untag = (all ?? []).filter((p) => !TITLES.includes(p.title)).map((p) => p.id);
  if (untag.length > 0) {
    await sb.from("promises").update({ tag: null }).in("id", untag);
  }

  console.log(`Tagged ${TITLES.length} promises as "100-Day Plan"`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
