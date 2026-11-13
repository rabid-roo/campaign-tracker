# Campaign Promise Tracker

Track election campaign promises and whether the elected government is delivering on them — with cited evidence (agendas, minutes, news) and a status timeline per promise.

## Trackers

- **New Westminster Progressives (2026)** — municipal council + school board platform (~121 promises)
- **BC NDP (2024)** — provincial "An Action Plan for You" platform
- **BC Conservatives (2026)** — provincial "Stronger BC" (hidden on the site)

## How it works

1. **Scrape** platform text → `data/raw/`
2. **Itemize** into promises → `data/items/<party>.promises.json`
3. **Import** to Supabase (`npm run import`)
4. **Research** delivery status from agendas, minutes and news → `status:merge` + `status:import`
5. **Surface** on the site: status badges, plan tags (e.g. "100-Day Plan"), evidence timeline, references, goals, and an "accurate?" vote.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS
- **Supabase** (Postgres) — public read-only (RLS); writes via service-role key
- **Deployed on Vercel** (`campaign-tracker-jet-zeta.vercel.app`), auto-deploying from the private GitHub repo

## Getting started

1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public reads)
   - `SUPABASE_SERVICE_ROLE_KEY` (local writes/imports only — never commit)
3. `npm run dev`

## Data management

| Command | Purpose |
|---|---|
| `npm run itemize:newwest` | Itemize the NWP platform |
| `npm run import` | Import itemized promises to Supabase (**⚠️ destructive** — deletes + re-inserts a party's promises, cascading to `status_updates`, `votes`, `references`, and `goals`) |
| `npm run status:merge -- <file.json>` | Merge a research agent's JSON into `data/status/updates.json` |
| `npm run status:import` | Import status updates to Supabase (dedupes) |
| `npm run refs:import` | Import references from `data/references/manual.json` |
| `npm run goals:import` | Import goals |
| `npx tsx scripts/tag/100-day-plan.ts` | Tag the NWP 100-day-plan promises |

## Docs

- `PLAN.md` — architecture, data model, roadmap
- `docs/status-research.md` — the repeatable status-research workflow
- `AGENTS.md` — agent guide (scripts, gotchas)
