---
name: tag-promises
description: Use when tagging promises by plan (e.g. the 100-Day Plan) so they show a badge and a filter tab. Trigger on "tag the 100-day plan", "mark promises by plan", "add a tag".
---

# Tag promises

Mark a set of promises with a plan tag (e.g. `"100-Day Plan"`).

## Steps

1. Ensure the `tag` column exists (migration `0006_promise_tag.sql`). If missing, run it via the SQL editor / `supabase db push` (see **apply-migration**).
2. Set `promises.tag` on the target promises.
3. Record the tag in the source of truth: add `"tag": "100-Day Plan"` to `data/items/<party>.promises.json`.
4. For the NWP 100-day plan specifically: `npx tsx scripts/tag/100-day-plan.ts`

## UI

- `src/components/tag-badge.tsx` renders the tag badge on the party list + promise detail pages.
- The party page has a `?tag=100-day-plan` filter tab (see `src/app/party/[slug]/page.tsx`).

## Adding a new tag value

`tag` is free text, so a new value works with the existing badge + filter with no code change — just set it in the DB and `data/items/`.
