---
name: add-reference
description: Use when attaching a cited source link (news article, PDF, letter) to a promise's References section. Trigger on "add a reference", "attach a source link", "cite this article".
---

# Add a reference

Attach a supplementary source link to a promise.

## Steps

1. Append to `data/references/manual.json`:
   ```json
   {
     "party": "new-west-progressives",
     "promise": "<exact title or UUID>",
     "label": "Freshet News — climate levy story",
     "url": "https://...",
     "source_type": "news",
     "note": "Optional one-line context."
   }
   ```
2. `npm run refs:import` (idempotent — safe to re-run)
   - Or just commit + push `manual.json`; the `import-data` GitHub Action auto-imports it on push.

## Fields

- `party` — slug (`bc-ndp`, `new-west-progressives`, `bc-conservatives`)
- `promise` — exact title (or UUID)
- `label` — short human-readable label
- `url` — the link
- `source_type` — `"web"` | `"news"` | `"archive"` | `"pdf"` | `"platform"` (free text, defaults to `"other"`)
- `note` — optional one-liner

## Notes

- References render in the "References" section of the promise detail page.
- Use them for **supplementary** sources. The primary status evidence lives in `status_updates` (see **status-research**).
