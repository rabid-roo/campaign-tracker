import { readFile, writeFile } from "node:fs/promises";

type P = {
  title: string;
  category: string;
  description: string;
  original_quote: string;
  source_url?: string;
  metric?: string;
  metric_source?: string;
};

const REMOVE = [
  "Keep building more housing, including opening the door to home ownership",
  "Lower costs for people",
  "Building & growing a sustainable economy with good-paying jobs",
  "Training and skills for good jobs",
  "Strong, sustainable, and climate-ready economy",
  "Making Homes, Businesses & Communities Safer",
  "Safe, vibrant and connected communities",
  "More Help For Students, Teachers & Staff",
  "Support for students, teachers and staff",
  "Strengthen relationships with Indigenous people",
];

const MERGE_REMOVE = [
  "Middle-class income tax cut",
  "Complete a full review of Health Authorities",
  "Put watershed planning in local hands for secure clean water",
  "Recruit and train more health professionals",
];

const RECAT: Record<string, string> = {
  "Create standardized online municipal building permit system": "governance-accountability",
  "Ramp up active forest management to protect communities from wildfire": "environment-climate",
  "Move BC's school bus fleet to electric": "environment-climate",
  "Advance Sumas Prairie flood prevention": "environment-climate",
  "Open secure care facilities under the Mental Health Act": "healthcare",
  "Designated mental health units in correctional centres": "healthcare",
};

const METRICS: Record<string, { metric: string; metric_source: string }> = {
  "Making sure everyone who wants a regular family doctor or nurse practitioner gets one": {
    metric: "Match everyone on the Health Connect Registry to a provider by end of 2025",
    metric_source: "BC Health Connect Registry",
  },
  "More doctors, nurse practitioners and nurses": {
    metric: "45,000 additional healthcare workers over 5 years",
    metric_source: "BC Gov health workforce data",
  },
  "Building or expanding hospitals across BC": {
    metric: "29 new/expanded hospitals",
    metric_source: "BC Gov",
  },
  "End deadly cervical cancer within a decade": {
    metric: "Eliminate cervical cancer within a decade",
    metric_source: "BC Cancer",
  },
  "Double public EV charging stations by 2030": {
    metric: "Double public EV chargers by 2030",
    metric_source: "BC Hydro / NRCan",
  },
  "Cap emissions from the oil and gas sector": {
    metric: "75% methane reduction by 2030",
    metric_source: "CleanBC GHG inventory",
  },
  "Protect 30% of BC's lands and waters by 2030": {
    metric: "Protect 30% of lands/waters by 2030 (20% as of 2026)",
    metric_source: "BC Gov (30×30)",
  },
  "Making BC a clean energy superpower": {
    metric: "Double electricity generation by 2050",
    metric_source: "CleanBC / BC Hydro",
  },
  "A sustainable future for forest workers, companies and communities": {
    metric: "Plant 300 million trees annually",
    metric_source: "BC Gov Forests",
  },
  "Expand Foundry Centres for Youth": {
    metric: "Foundry centres in 10 more communities",
    metric_source: "Foundry BC",
  },
  "More Nurses and Home Support for BC Seniors": {
    metric: "$324 million over 3 years",
    metric_source: "BC Gov Budget",
  },
  "Build new child care spaces": {
    metric: "$500 million initial investment",
    metric_source: "BC Gov",
  },
  "Open the door to more home ownership": {
    metric: "25,000 attainable homes (60/40 shared-equity)",
    metric_source: "BC NDP / BC Gov",
  },
  "Double Apprenticeship Training": {
    metric: "Double apprenticeship training",
    metric_source: "BC Gov",
  },
  "Security & Affordability For BC Seniors": {
    metric: "5,400 new long-term care beds; seniors supplement +$50/mo",
    metric_source: "BC Gov Budget",
  },
  "Freeze ICBC premiums": {
    metric: "ICBC basic rates frozen",
    metric_source: "ICBC",
  },
  "Remove BC's consumer carbon tax if Ottawa lifts national requirement": {
    metric: "Consumer carbon tax rate to $0",
    metric_source: "BC Gov News",
  },
  "Protecting you from the return of costly MSP premiums": {
    metric: "MSP premiums remain eliminated",
    metric_source: "BC Gov",
  },
  "Building more homes for renters and buyers": {
    metric: "300,000 more middle-class homes",
    metric_source: "CMHC / BC Gov",
  },
  "Strengthen Protections for BC Workers": {
    metric: "Minimum wage highest in Canada, indexed to inflation",
    metric_source: "StatsCan",
  },
};

async function main() {
  const path = "data/items/bcndp-2024.promises.json";
  const items = JSON.parse(await readFile(path, "utf8")) as P[];

  const toRemove = new Set([...REMOVE, ...MERGE_REMOVE]);
  const kept = items.filter((it) => !toRemove.has(it.title));

  const out = kept.map((it) => {
    const category = RECAT[it.title] ?? it.category;
    const m = METRICS[it.title];
    return m ? { ...it, category, ...m } : { ...it, category };
  });

  await writeFile(path, JSON.stringify(out, null, 2), "utf8");

  const missingRemoves = [...toRemove].filter((t) => !items.some((i) => i.title === t));
  const missingMetrics = Object.keys(METRICS).filter((t) => !out.some((i) => i.title === t));

  console.log(`Removed ${items.length - out.length} (kept ${out.length})`);
  console.log(`Metrics set on ${out.filter((i) => i.metric).length} promises`);
  if (missingRemoves.length) console.log("WARN missing removes:", missingRemoves);
  if (missingMetrics.length) console.log("WARN missing metrics:", missingMetrics);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
