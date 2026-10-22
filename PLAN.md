# Campaign Tracker — Project Plan

Track election campaign promises, itemize them, and show their delivery status
(completed / in progress / cancelled) backed by cited evidence.

Two trackers:
1. **2024 BC NDP** — provincial campaign promises ("An Action Plan for You", Oct 2024)
2. **2026 New West Progressives** — municipal campaign promises

---

## Stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Database:** Supabase (Postgres)
- **Hosting:** Local dev first (`npm run dev`); deploy to Vercel later (no code changes needed)
- **Data pipeline:** Node/TS scraper scripts + DeepSeek-assisted itemization + manual review
- **ORM/query:** Supabase JS client (anon client for reads; service-role key for import scripts)

## Approach (Hybrid)

1. **Scrape** raw source text (platform PDFs / web pages) into normalized files.
2. **Itemize** into structured promises (title, category, original quote, source URL).
   - DeepSeek (OpenAI-compatible API) drafts promise items from raw text — always human-reviewed.
3. **Review** council documents, public records, and news to assign a status.
4. **Record** status + evidence (source links, dates, notes) in Supabase.

---

## Data Model (Supabase)

```
parties
  id (uuid pk), name, slug (unique), election, year, description

categories                         -- unified/shared taxonomy across both parties
  id, name, slug, sort_order

promises
  id, party_id (fk), category_id (fk, nullable)
  title, description, original_quote, source_url, source_type (platform|pdf|web|news)
  current_status (enum), status_summary
  created_at, updated_at

status_updates                    -- audit trail / timeline
  id, promise_id (fk)
  status (enum), summary, evidence_url, evidence_source, dated_on, created_at
```

### Status enum

- `not_started`
- `in_progress`
- `partially_complete`
- `completed`
- `cancelled`

`promises.current_status` mirrors the latest `status_updates` row for fast filtering;
the timeline keeps full history.

---

## Scraping Pipeline

```
scripts/
  scrape/
    bcndp-2024.ts        # extract 2024 PDF text -> data/raw/bcndp-2024.txt
  itemize/
    itemize.ts           # DeepSeek-assisted: raw text -> structured promise JSON
    import.ts            # upsert JSON -> Supabase
data/
  raw/                   # raw scraped text
  items/                 # reviewed/structured promise JSON per party
```

- BC NDP: PDF text extraction via `pdf-parse` (66 pages).
- NWP is behind Cloudflare bot protection (`Cf-Mitigated: challenge`), so automated
  fetch/Playwright is blocked. Its 15 pages were captured via a web-fetch tool into
  `data/raw/newwest-2026.txt` (URL list embedded in the file as `PAGE N ::` separators).
- Output is committed to the repo for auditability; import scripts push to Supabase.

---

## App Pages

**Public**
- `/` — landing, links to both trackers
- `/party/[slug]` — promise list grouped by category, filter by status, progress stats
- `/promise/[id]` — detail: status, original quote, evidence timeline

**Data management (owner-only, no login)**
- Data is added/edited via import scripts (service-role key) and the Supabase dashboard.
- The public site is strictly read-only.

---

## Phases / Roadmap

1. **Scaffold** — `create-next-app` (TS, Tailwind), wire Supabase client, env vars; run locally.
2. **Schema** — SQL migrations + RLS (public read only; writes via service-role key).
3. **Scrapers** — build BC NDP (2024) + New West extractors, commit raw text.
4. **Seed data** — itemize promises (DeepSeek pass + manual review), import to Supabase.
5. **Public UI** — landing, party list, promise detail, progress stats.
6. **Data management** — owner adds/edits data via import scripts (service-role key) + Supabase dashboard.
7. **Deploy** — migrate to Vercel (Supabase already cloud), env config, custom domain (optional).
8. **Maintain** — recurring review workflow, new evidence -> status updates.

---

## Decisions (locked)

- BC NDP: track the **2024 "An Action Plan for You"** platform only.
- Itemization: **DeepSeek** API (OpenAI-compatible), human-reviewed.
- Taxonomy: **unified/shared** category list across both parties.
- Hosting: **local dev first**, deploy to Vercel later.
- Database: **Supabase Cloud** (free tier) — works from localhost, no migration later.
- Auth: **none** — no user login. Owner dictates all data via scripts/service-role key + dashboard; public site is read-only.

## Sources (confirmed)

- **BC NDP 2024** ("An Action Plan for You", released Oct 3 2024):
  - Highlights PDF: `https://www.bcndp.ca/sites/default/files/bcndp_platformhighlights_v2_printready-web_0.pdf`
  - Full platform PDF to be pinned during Phase 3 (mirrors exist; e.g. chbabc.org, news summaries).
- **New West Progressives 2026**:
  - Platform hub: `https://nwprogress.ca/nwp-platform/#nwp-policies` (links ~14 sub-plans)
  - 100-Day Plan: `https://nwprogress.ca/100-day-plan/` (15 actions; PDF: `.../2026/09/100-Day-plan.pdf`)

## Remaining Open Questions

- [ ] DeepSeek API key (account at platform.deepseek.com) — needed for the itemize pass (Phase 4).
