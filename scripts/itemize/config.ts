export type Category = { slug: string; name: string };

// Unified/shared taxonomy across both parties.
export const CATEGORIES: Category[] = [
  { slug: "housing", name: "Housing" },
  { slug: "affordability", name: "Affordability & Cost of Living" },
  { slug: "healthcare", name: "Healthcare" },
  { slug: "economy-jobs", name: "Economy & Jobs" },
  { slug: "environment-climate", name: "Environment & Climate" },
  { slug: "public-safety", name: "Public Safety" },
  { slug: "transit-infrastructure", name: "Transit & Infrastructure" },
  { slug: "education-childcare", name: "Education & Childcare" },
  { slug: "governance-accountability", name: "Governance & Accountability" },
  { slug: "community-services", name: "Community & Social Services" },
  { slug: "recreation-culture", name: "Recreation & Culture" },
  { slug: "other", name: "Other" },
];

export type Party = {
  key: string;
  name: string;
  slug: string;
  election: string;
  year: number;
  description: string;
  raw: string;
  out: string;
  sourceUrl?: string;
  sourceType: "pdf" | "web";
};

export const PARTIES: Party[] = [
  {
    key: "bcndp-2024",
    name: "BC NDP",
    slug: "bc-ndp",
    election: "2024 BC Provincial Election",
    year: 2024,
    description: "BC NDP 2024 campaign platform — 'An Action Plan for You'",
    raw: "data/raw/bcndp-2024.txt",
    out: "data/items/bcndp-2024.promises.json",
    sourceUrl:
      "https://www.bcndp.ca/sites/default/files/bcndp_anactionplanforyou_final_final_final_final_web_0.pdf",
    sourceType: "pdf",
  },
  {
    key: "newwest-2026",
    name: "New Westminster Progressives",
    slug: "new-west-progressives",
    election: "2026 New Westminster Municipal Election",
    year: 2026,
    description:
      "New Westminster Progressives 2026 platform — city council and school board",
    raw: "data/raw/newwest-2026.txt",
    out: "data/items/newwest-2026.promises.json",
    sourceType: "web",
  },
];
