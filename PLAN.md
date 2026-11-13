# Campaign Tracker — Project Plan

Track election campaign promises, itemize them, and show their delivery status
(completed / in progress / cancelled) backed by cited evidence.

Three trackers:
1. **2024 BC NDP** — provincial campaign promises ("An Action Plan for You", Oct 2024)
2. **2026 New West Progressives** — municipal campaign promises (~120 promises)
3. **2026 BC Conservatives** — provincial ("Stronger BC", 2026; currently hidden)

---

## Current state (Nov 2026)

- **Deployed on Vercel** (`campaign-tracker-jet-zeta.vercel.app`), linked to the private GitHub repo (`rabid-roo/campaign-tracker`) for auto-deploys.
- **NWP is the active tracker**: 121 promises itemized, statuses researched from the new council's inaugural + Nov 6 special meeting, a `100-Day Plan` tag on the 17 first-100-days promises, and evidence + references (agendas, Freshet News, Daily Hive, WCEL).
- **Status research is a repeatable loop** — see `docs/status-research.md`.

---

## Stack

- **Framework:** Next.js (App Router, Turbopack) + TypeScript + Tailwind CSS
- **Database:** Supabase (Postgres) — public read-only; writes via service-role key
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Data pipeline:** Node/TS scraper scripts + DeepSeek-assisted itemization + manual review
- **Query:** Supabase JS client (anon for reads; service-role key for import scripts)

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

categories                         -- unified/shared taxonomy across all parties
  id, name, slug, sort_order

promises
  id, party_id (fk), category_id (fk, nullable)
  title, description, original_quote, source_url, source_type (platform|pdf|web|news)
  current_status (enum), status_summary, metric, metric_source, tag
  created_at, updated_at

status_updates                    -- audit trail / timeline
  id, promise_id (fk)
  status (enum), summary, evidence_url, evidence_source, dated_on, created_at

references                        -- multiple cited sources per promise
  id, promise_id (fk), label, url, source_type, page, note, sort_order

goals                             -- measurable targets
  id, promise_id (fk), label, target, unit, target_value, current_value, status, source_url

votes                             -- "accurate?" up/down votes per promise
  id, promise_id (fk), vote
```

### Status enum

- `not_started`
- `in_progress`
- `partially_complete`
- `completed`
- `cancelled`

`promises.current_status` mirrors the latest `status_updates` row for fast filtering;
the timeline keeps full history. **The sync trigger fires on INSERT only** — updating an
existing `status_updates` row does not re-sync `current_status` (update it manually).

`promises.tag` (migration `0006`) holds an optional plan label (e.g. `"100-Day Plan"`).

---

## Scraping & Itemization Pipeline

```
scripts/
  scrape/            # raw text extraction (PDF/web)
  itemize/           # DeepSeek-assisted: raw text -> structured promise JSON; import -> Supabase
  status/            # status research merge + import (repeatable loop)
  references/        # generate + import source references
  goals/             # import + derive goals
  tag/               # 100-day-plan tagging
data/
  raw/               # raw scraped text
  items/             # reviewed/structured promise JSON per party
  status/updates.json  # pending status updates (merged from research agents)
  references/        # manual references
  goals/             # goals
```

- BC NDP: PDF text extraction via `pdf-parse` (66 pages).
- NWP is behind Cloudflare bot protection, so its pages were captured via a web-fetch tool
  into `data/raw/newwest-2026.txt` (`PAGE N ::` separators). Note: the original scrape
  missed the "Putting Residents First" sub-plan; those commitments were recovered manually.
- Output is committed to the repo for auditability; import scripts push to Supabase.

---

## Status research workflow (repeatable)

See `docs/status-research.md`. In short:

```
research agent → JSON → status:merge → data/status/updates.json → status:import → Supabase
```

The research agent has **no DB access** — it returns JSON only; import happens locally
with the service-role key.

---

## App Pages

**Public**
- `/` — landing, links to trackers
- `/party/[slug]` — promise list grouped by category, filter by status (`?status=`) and plan tag (`?tag=100-day-plan`)
- `/promise/[id]` — detail: status, tag, goals, references, evidence timeline, "accurate?" vote

**Data management (owner-only, no login)**
- Data is added/edited via import scripts (service-role key) and the Supabase dashboard.
- The public site is strictly read-only.

---

## Phases / Roadmap

1. **Scaffold** — done.
2. **Schema** — done (migrations `0001`–`0006`).
3. **Scrapers** — done (BC NDP + NWP raw text).
4. **Seed data** — done (BC NDP + NWP itemized; NWP expanded to 121 promises).
5. **Public UI** — done (landing, party list, promise detail, status + tag filters).
6. **Data management** — done (status/references/goals import scripts).
7. **Deploy** — done (Vercel; GitHub auto-deploy wired).
8. **Maintain** — ongoing (recurring status research + evidence).

---

## Decisions (locked)

- BC NDP: track the **2024 "An Action Plan for You"** platform only.
- Itemization: **DeepSeek** API (OpenAI-compatible), human-reviewed.
- Taxonomy: **unified/shared** category list across all parties.
- Database: **Supabase Cloud** — public read-only; writes via service-role key.
- Hosting: **Vercel**, auto-deploy from the private GitHub repo.
- Auth: **none** — no user login. Owner dictates all data via scripts/service-role key + dashboard.
- Status semantics: `in_progress` = action has actually begun (motion passed / staff directed);
  `not_started` = untouched. A promise merely "discussed" on an agenda with an outcome is `in_progress`.

## Sources (confirmed)

- **BC NDP 2024** ("An Action Plan for You", Oct 2024)
- **New West Progressives 2026**:
  - Platform hub: `https://nwprogress.ca/nwp-platform/#nwp-policies` (~14 sub-plans, incl. Putting Residents First)
  - 100-Day Plan: `https://nwprogress.ca/100-day-plan/` (15 actions)
  - Council agendas: eScribe at `https://pub-newwestcity.escribemeetings.com/`
- **News (NWP delivery tracking)**:
  - Freshet News (local co-op) — primary council coverage
  - Daily Hive (Urbanized) — inaugural speech transcript
  - Business Examiner — syndicated council coverage
  - West Coast Environmental Law — advocacy (Sue Big Oil)
  - Mainstream (CBC/CTV/Global/Vancouver Sun) do **not** cover New West municipal politics.

## Remaining Open Questions

- [ ] DeepSeek API key for re-running itemization passes (current items already imported).
- [ ] Whether to track more BC parties / other municipal governments.
