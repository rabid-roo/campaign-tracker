# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Residents and voters checking whether their council or province delivered on what it promised — usually right after hearing a claim, in a short session, on a phone. They are not researchers: they want to see what was promised, what happened, and the source behind it, without reading a report.

## Product Purpose

Track election campaign promises and whether the elected government is delivering on them. Each promise carries a status, a dated timeline of evidence, and links to the sources (agendas, minutes, news, platform PDFs) behind every change. Success means a reader can settle "did they actually do this?" from the page itself, without trusting the site's summary.

## Positioning

Every promise carries a dated status timeline with a linkable source per change, so a status is auditable back to an agenda item or news report. A neighbouring tracker can copy the list of promises; it cannot truthfully copy a trail it never recorded.

## Operating Context

- Three trackers: **New Westminster Progressives 2026** (`new-west-progressives`, municipal council + school board, ~121 promises), **BC NDP 2024** (`bc-ndp`, ~112 promises), **BC Conservatives 2026** (`bc-conservatives`, ~151 promises, hidden from the site).
- Promise data is itemized from platform text and stored as committed JSON under `data/`, then imported to Supabase.
- Delivery status is researched from primary sources (council agendas and minutes, Hansard, provincial news, Wayback captures) and merged through `data/status/updates.json`.
- Status vocabulary: `not_started` · `in_progress` · `partially_complete` · `completed` · `cancelled`. `in_progress` means action actually began (motion passed, staff directed), not merely that the promise exists.
- Hidden trackers keep full data and tooling; only publication is withheld.

## Capabilities and Constraints

- Next.js (App Router) + Supabase (Postgres), public read-only through RLS; every write goes through the service-role key in scripts, never the browser.
- `npm run import` is destructive (deletes and re-inserts a party's promises, cascading to status updates, votes, references, and goals); one-off edits never use it.
- Schema changes require the Supabase SQL editor or `supabase db push` — PostgREST cannot run DDL.
- Visitors can vote a promise "accurate / inaccurate" anonymously; votes are net counts with a per-visitor basic rate limit, no accounts.
- Site pages: tracker index, party tracker (promises by category, plan tag, status), promise detail (quote, description, goals, status history, references, vote).

## Brand Commitments

- Product name: **Campaign Promise Tracker**.
- Voice is neutral and factual: it reports delivery state and cites sources; it does not editorialize about parties or candidates.

## Evidence on Hand

- Committed artifacts: itemized promises (`data/items/`), researched status updates (`data/status/updates.json`), references (`data/references/`), goals (`data/goals/`), review reports (`data/review/`), raw platform scrapes (`data/raw/`).
- Live data: 3 parties, 12 categories, 384 promises, 144 status updates, 1 reference set of 638 rows, 5 goals.
- Per-promise original platform quote, category, plan tag (`100-Day Plan`), metric/target, and source URL.
- No testimonials, press coverage, benchmarks, or endorsements exist; future work must not invent them.

## Product Principles

1. Evidence before assertion: a status without a linkable source does not ship.
2. Show the trail, not the verdict: the timeline and sources are the product; the badge is a summary.
3. Neutral by construction: report what a government did and did not do, with dates, and let the reader judge.
4. Full platform, not a shortlist: every itemized promise appears, including the ones with no action yet.
5. The reader is a resident on a phone in a hurry: state, source, and date must be legible above anything else.
