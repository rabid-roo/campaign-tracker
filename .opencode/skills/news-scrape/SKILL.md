---
name: news-scrape
description: Use when searching news sites for evidence of promise delivery or council action (Freshet News, Daily Hive, CBC, CTV, Global, etc.). Trigger on "scrape news", "find news evidence", "check media coverage".
---

# News scrape

Search news outlets for evidence that a government/council is (or isn't) acting on promises.

## Sources that cover New Westminster municipal politics

- **Freshet News** (`freshetnews.ca`) — the primary local co-op. Search: `https://www.freshetnews.ca/?s=QUERY`
- **Daily Hive (Urbanized)** — inaugural speeches, major announcements, infrastructure.
- **Business Examiner** — syndicated council coverage.
- **West Coast Environmental Law** (`wcel.org`) — advocacy/open letters (e.g. Sue Big Oil).
- **Syndicated Canadian Press/LJI** — Penticton Herald, The Hamilton Spectator, etc. carry Freshet/LJI copy.

## Outlets that do NOT cover New West municipal politics

CBC, CTV, Global News, Vancouver Sun — their BC sections are regional/provincial only. Don't spend long here; note the gap.

## Method

- Use **DuckDuckGo html search** for cross-outlet + syndication hits: `https://html.duckduckgo.com/html/?q=QUERY`
- Use the **Wayback Machine** (`web.archive.org`) for Cloudflare-protected pages (e.g. `nwprogress.ca` sub-pages) — the archive URL is the stable cite.
- Try `site:` searches and the outlet's own `?s=` search when available.

## Record findings

- Feed outcomes into **status-research** (status evidence) or **add-reference** (supplementary links).
- Capture URL, outlet, date, author, and vote counts (e.g. "6-1", "7-0") and who opposed — the opposition voice is usually the critical angle.
