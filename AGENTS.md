<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Campaign Promise Tracker — Agent Guide

Track election campaign promises and whether the elected government is delivering on them, backed by cited evidence (agendas, minutes, news). Each promise has a status and a timeline of evidence.

Trackers: **New Westminster Progressives 2026** (`new-west-progressives`), **BC NDP 2024** (`bc-ndp`), BC Conservatives 2026 (`bc-conservatives`, hidden).

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4
- Supabase (Postgres) — RLS is **public read-only**; all writes go through the **service-role key** in `.env.local` (never committed, never in browser)
- Data pipeline: Node/TS scripts under `scripts/`, committed artifacts under `data/`
- Deployed on Vercel (`campaign-tracker-jet-zeta.vercel.app`)

## Data model (Supabase)

- `parties`, `categories`, `promises`, `status_updates`, `references`, `goals`, `votes`
- `promises.current_status` mirrors the latest `status_updates` row. A DB trigger syncs it **on INSERT only** — editing an existing `status_updates` row does NOT re-sync, so update `promises.current_status` manually in that case. The trigger is the **source of truth**; `scripts/goals/derive.ts` is a one-off reconciliation tool that can overwrite it from goal rollups (re-run the trigger's logic afterward if goals and statuses diverge).
- `promises.tag` (migration `0007`) holds an optional plan label, e.g. `"100-Day Plan"`.
- `source_type` is split-brained: `promises.source_type` is a strict enum (`platform|pdf|web|news`) while `references.source_type` is free text (scripts insert `archive`, `backup`, `other`). Treat `references.source_type` as free-form.

### Status enum

`not_started` · `in_progress` · `partially_complete` · `completed` · `cancelled`

Semantics: `in_progress` = action actually began (motion passed / staff directed); `not_started` = untouched.

### Party slugs

`bc-ndp` · `new-west-progressives` · `bc-conservatives` (see `scripts/itemize/config.ts`)

## Key commands

| Command | Purpose |
|---|---|
| `npm run itemize:newwest` | Itemize NWP platform (DeepSeek-assisted) |
| `npm run import` | Import itemized promises → Supabase. **⚠️ Destructive** — deletes + re-inserts all promises for each party, cascading to `status_updates`, `votes`, `references`, and `goals`. Never use for one-off edits. |
| `npm run status:merge -- <file.json>` | Merge research JSON into `data/status/updates.json` |
| `npm run status:import` | Import `updates.json` → `status_updates` (dedupes) |
| `npm run refs:import` | Import references from `data/references/manual.json` |
| `npm run goals:import` | Import goals |

## Gotchas

- **BOM in `data/status/updates.json`** — `status:merge`/`status:import` now strip a leading BOM on read, so this is handled.
- **`npm run import` is destructive** — never use it for one-off edits. It cascades to `status_updates`, `votes`, `references`, and `goals`.
- **Supabase can't run DDL from PostgREST.** Schema changes require the Supabase SQL editor or `supabase db push`. No direct DB connection string in this repo.
- **`.env.local` is gitignored** — never commit keys. Public app needs `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env; writes need `SUPABASE_SERVICE_ROLE_KEY` locally.
- **Evidence discipline**: only mark a status change when there's a linkable source. Keep `evidence_url` / `evidence_source` / `dated_on` populated.
- **Hidden parties** (`hidden = true`) are filtered out of the public site and return 404 on direct `/promise/<id>` URLs.
- **Votes are write-locked to the service-role key** (migration `0008`); the anon key can only `select`. The `/api/vote` route uses the service-role client and applies a per-instance in-memory rate limit.

## Skills

Step-by-step workflows live as skills in `.opencode/skills/` (loaded on demand): `status-research`, `news-scrape`, `promise-audit`, `add-promise`, `add-reference`, `tag-promises`, `apply-migration`, `deploy`.
