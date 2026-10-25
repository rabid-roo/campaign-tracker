# Adding web references (repeatable process)

For parties whose promises live on individual **web pages** (rather than a single
PDF), you can attach each page as a reference — plus a Wayback Machine archive
link — and auto-submit missing pages to the Wayback Machine.

## Files

- `data/references/web-links.json` — the mapping (source of truth). Each entry:
  ```json
  {
    "party": "bc-conservatives",            // party slug from scripts/itemize/config.ts
    "promise": "Keep more of what you earn", // exact promise title (or its id)
    "label": "$1,000 Tax Cut",               // human label shown on the page
    "url": "https://conservativebc.ca/plan/..."
  }
  ```
- `scripts/references/link-web.ts` — reads the mapping and:
  1. Checks each URL against the Wayback Machine availability API.
  2. If missing, submits it to Wayback's "Save Page Now" (`web.archive.org/save/<url>`).
  3. Adds a `web` reference and a `Wayback Machine archive` reference to the promise.

## Run

```
npm run web:link
```

## Adding a new party / province / municipality

1. Add the party to `scripts/itemize/config.ts` (name, slug, election, year, etc.).
2. Scrape + itemize + import (see `scripts/scrape/`, `scripts/itemize/`).
3. Trawl their platform page for sub-page links (fetch it in the browser or via
   `webfetch`), and add each relevant link to `data/references/web-links.json`.
4. Run `npm run web:link`.

## Notes

- The script is idempotent: it skips references whose URL already exists.
- Wayback archiving is asynchronous — a "Save Page Now" submission can take a few
  minutes to complete, and is rate-limited (one URL at a time is fine; a large
  batch may hit HTTP 429 "too many requests"). Re-run later to pick up stragglers.
- A 5-second delay is added between submissions to respect archive.org's limits.
- For a party's main PDF (like a platform document), host a local backup copy in
  `public/` and add it as a `backup` reference with a "Downloaded <date>" note
  (see `scripts/references/set-bccons-source.ts`).
