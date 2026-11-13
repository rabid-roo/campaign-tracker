---
name: add-promise
description: Use when adding a single promise to the tracker WITHOUT using the destructive npm run import. Trigger on "add a promise", "add this commitment", "track this promise".
---

# Add a single promise

Add one promise to the tracker safely.

## Steps

1. Add it to `data/items/<party>.promises.json`:
   ```json
   {
     "title": "...",
     "category": "<slug>",
     "description": "...",
     "original_quote": "...",
     "source_url": "...",
     "metric": "...",
     "metric_source": "...",
     "tag": "100-Day Plan"
   }
   ```
2. Insert it into Supabase with a **targeted insert script** (using `SUPABASE_SERVICE_ROLE_KEY`), NOT `npm run import`:
   - `promises` row: `party_id`, `category_id`, `title`, `description`, `original_quote`, `source_url`, `source_type`, `current_status` (default `not_started`).
   - If it has a status/evidence, also insert a `status_updates` row.
3. If it has a supplementary source, see **add-reference**.

## Why not `npm run import`

`npm run import` deletes and re-inserts **all** promises for a party, cascading to `status_updates` (wipes history). Never use it for a single add/edit.

## Categories (slug)

`housing`, `affordability`, `healthcare`, `economy-jobs`, `environment-climate`, `public-safety`, `transit-infrastructure`, `education-childcare`, `governance-accountability`, `community-services`, `recreation-culture`, `other` (see `scripts/itemize/config.ts`).
