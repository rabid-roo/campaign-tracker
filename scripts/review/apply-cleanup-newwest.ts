import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env vars may come from the shell instead
}

type P = {
  title: string;
  category: string;
  description: string;
  original_quote: string;
  source_url?: string;
  metric?: string;
  metric_source?: string;
};

const ROLLUPS = [
  "Make our city safe again",
  "Ensure the city operates with a realistic budget",
  "Revive our neglected amenities and infrastructure",
  "Revitalize downtown and our business districts",
  "Put you at the center of every decision",
  "Focus on parks and green space",
  "Tackle over-crowded schools",
  "Be practical and measured",
  "Greener New West",
  "Celebrate New West",
  "Commitment to Queensborough",
  "Commitment to Downtown",
  "Commitment to Seniors",
  "Heritage Plan",
  "Stronger Together New West",
  "100-Day Plan",
  "Building and learning for the future",
  "Student success & well-being",
  "Safe, healthy and inclusive schools",
  "Collaborative & transparent leadership",
];

const DUP_100DAY = [
  "Cut the 3.5% electricity climate tax",
  "Put affordability back into the budget",
  "Cancel the Sue Big Oil campaign",
  "Start hiring 12 new community enforcement and safety officers",
  "Clean up and repair our neighbourhoods",
  "Get the City and schools working together again",
  "Cut red tape at City Hall",
  "Kickstart the Columbia District",
  "Tackle our 20 worst traffic bottlenecks",
  "Take action on train noise",
];

const METRICS: Record<string, { metric: string; metric_source: string }> = {
  "Eliminate the Electricity Surtax": {
    metric: "Remove 3.5% electricity surtax (~$2.1M)",
    metric_source: "NWP Platform",
  },
  "Reduce External Consultant Spending": {
    metric: "Cut consultant spending 20% within 2 years",
    metric_source: "NWP Platform",
  },
  "Eliminate Patio Permit Fees and Expand Patio Seating": {
    metric: "Free patio permits; +25% patio seating",
    metric_source: "NWP Platform",
  },
  "Introduce a Lower-Cost Three-Year Business License": {
    metric: "3-year business license option",
    metric_source: "NWP Platform",
  },
  "Place at least 12 new Community Enforcement and Safety Officers": {
    metric: "12+ Community Enforcement and Safety Officers",
    metric_source: "NWP Platform",
  },
  "Triple investment in I's On the Street program": {
    metric: "Triple the On the Street program funding",
    metric_source: "NWP Platform",
  },
  "Enhance street cleaning and add 100 new waste and recycling bins": {
    metric: "100 new waste/recycling bins",
    metric_source: "NWP Platform",
  },
  "Establish a new TAG Team to reduce graffiti": {
    metric: "Hate graffiti removed within 4 hours",
    metric_source: "NWP Platform",
  },
  "Recreation facilities: Ryall Park turf field and track": {
    metric: "Artificial turf + all-weather track at Ryall Park",
    metric_source: "NWP Platform",
  },
  "Student bus service to NWSS": {
    metric: "Free bus service for Queensborough students to NWSS",
    metric_source: "NWP Platform",
  },
  "Deliver a Heritage Plan in 18 Months": {
    metric: "Heritage Plan within 18 months",
    metric_source: "NWP Platform",
  },
  "Freeze mayor, council and senior executive pay": {
    metric: "Freeze mayor/council/exec pay",
    metric_source: "NWP 100-Day Plan",
  },
  "Launch an independent core services review": {
    metric: "Independent core services review",
    metric_source: "NWP 100-Day Plan",
  },
  "Get the waterfront pier rebuild moving": {
    metric: "Pier rebuild plan before Council",
    metric_source: "NWP 100-Day Plan",
  },
  "Create the Columbia District": {
    metric: "10+ micro-retail spaces",
    metric_source: "NWP Platform",
  },
};

async function main() {
  const path = "data/items/newwest-2026.promises.json";
  const items = JSON.parse(await readFile(path, "utf8")) as P[];

  const toRemove = new Set([...ROLLUPS, ...DUP_100DAY]);
  const kept = items.filter((it) => !toRemove.has(it.title));

  const out = kept.map((it) => {
    const m = METRICS[it.title];
    return m ? { ...it, ...m } : it;
  });

  await writeFile(path, JSON.stringify(out, null, 2), "utf8");

  const missingRemoves = [...toRemove].filter((t) => !items.some((i) => i.title === t));
  const missingMetrics = Object.keys(METRICS).filter((t) => !out.some((i) => i.title === t));

  console.log(`Removed ${items.length - out.length} (kept ${out.length})`);
  console.log(`Metrics set on ${out.filter((i) => i.metric).length} promises`);
  if (missingRemoves.length) console.log("WARN missing removes:", missingRemoves);
  if (missingMetrics.length) console.log("WARN missing metrics:", missingMetrics);

  // ---- Surgical DB update (NWP only; avoids touching BC NDP statuses/refs/votes) ----
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  const supabase = createClient(url, key);

  const { data: partyRow } = await supabase
    .from("parties")
    .select("id")
    .eq("slug", "new-west-progressives")
    .single();
  if (!partyRow) throw new Error("NWP party not found");

  const { data: rows } = await supabase
    .from("promises")
    .select("id, title")
    .eq("party_id", partyRow.id);
  const byTitle = new Map((rows ?? []).map((r) => [r.title, r.id]));

  // Delete removed promises
  let deleted = 0;
  for (const t of toRemove) {
    const id = byTitle.get(t);
    if (id) {
      await supabase.from("promises").delete().eq("id", id);
      deleted++;
    }
  }

  // Update metrics on kept promises
  let metricUpdated = 0;
  for (const it of out) {
    const id = byTitle.get(it.title);
    if (id && it.metric) {
      await supabase
        .from("promises")
        .update({ metric: it.metric, metric_source: it.metric_source })
        .eq("id", id);
      metricUpdated++;
    }
  }

  console.log(`DB: deleted ${deleted} promises, updated metrics on ${metricUpdated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
