# Status research — repeatable process

How to take a research agent's findings and get them into the site.

## The loop

```
research agent  →  JSON file  →  status:merge  →  updates.json  →  status:import  →  Supabase
```

The research agent has **no database access**. It only returns JSON. The import
happens locally using your `SUPABASE_SERVICE_ROLE_KEY` (in `.env.local`), which
never leaves this machine.

## 1. Research agent

Run any agent (Claude, ChatGPT, a subagent, etc.) with a prompt that asks it to
produce findings in **this exact schema**:

```json
[
  {
    "party": "new-west-progressives",
    "promise": "<exact promise title>",
    "status": "in_progress | completed | not_started | partially_complete | cancelled",
    "summary": "<1-2 factual sentences>",
    "evidence_url": "<URL of the source (agenda, release, article)>",
    "evidence_source": "<short label, e.g. '2026-11-17 Council agenda item 6.2'>",
    "dated_on": "2026-11-17"
  }
]
```

- `party` is the slug from `scripts/itemize/config.ts`.
- `promise` must match a title exactly (or use the promise's UUID).
- `status` is one of the enum values.

## 2. Merge into the status file

Save the agent's JSON to a file, then merge it (dedupes by party+promise+status+summary):

```
npm run status:merge -- path/to/agent-output.json
```

This appends new entries to `data/status/updates.json`.

## 3. Import to Supabase

```
npm run status:import
```

This resolves each `promise` to its UUID (exact title match, then fuzzy),
inserts a `status_updates` row, and a DB trigger syncs `promises.current_status`.

## Adding a new party

See `docs/web-references.md` (scrape/itemize/import) — the status loop above is the
same regardless of party.

## Scheduled discovery: first-pass investigation

This is a recommendation for a follow-up implementation, not a running
scraper. Discovery should surface possible evidence for a human; it must not
assign promise statuses or write to Supabase.

### Recommendation

Prefer a separate **GitHub Actions scheduled workflow**, analogous to
`.github/workflows/import-data.yml`. It can run the existing Node tooling and
create GitHub issues directly, without adding a public application endpoint.
Use a daily UTC schedule away from the top of the hour and allow manual
dispatch. Scheduled runs can be delayed or dropped, so each run should scan an
overlapping lookback window rather than assuming it ran yesterday. Scheduled
workflows run from the default branch. See
[GitHub's schedule guidance](https://docs.github.com/en/actions/managing-issues-and-pull-requests/scheduling-issue-creation).

Vercel Cron is an alternative, but requires a deployed HTTP route, authenticated
with `CRON_SECRET`, plus durable state and GitHub credentials to create review
issues. Verify the project's plan and limits before choosing it; for example,
Vercel documents daily-only scheduling and an execution window on Hobby. See
[Vercel Cron documentation](https://vercel.com/docs/schedules/cron-jobs)
and [management guidance](https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs).
Neither scheduler establishes whether the sources are reachable from its
network.

Use **GitHub issues as the review queue** rather than committing generated
drafts to `data/review/`: issues give reviewers an actionable open/closed state
and avoid automated commits to `master`. Include source URL, title, source date
if known, discovery date, source kind, and a short factual excerpt or reason
for review. Treat article text as untrusted data; do not execute it or include
credentials. A reviewer verifies the source and relevance, then uses the
existing status or reference workflow. After review, changes pushed to
`data/status/**`, `data/references/**`, or `data/goals/**` trigger the existing
import workflow on `master`.

### Sources and access

- **Council:** discover meetings, agendas and minutes from
  `https://pub-newwestcity.escribemeetings.com/`. Check separately for newly
  published minutes or revised agenda documents for an existing meeting.
- **News:** discover relevant Freshet articles from
  `https://www.freshetnews.ca/` and investigate reliable feeds or search for
  syndicated LJI coverage. Search results alone do not prove relevance.
- **Platform:** use the NWP URLs in `data/references/web-links.json` or
  `data/items/newwest-2026.promises.json` as a starting list. Compare actual
  page content, not just URLs or archive timestamps, and link both snapshots
  when flagging a change.
- **Wayback:** the `news-scrape` skill recommends it for protected pages, but
  snapshots can be missing or stale. Record the snapshot timestamp and URL;
  never treat a stale snapshot as proof that the live page has not changed.
  `docs/web-references.md` describes existing asynchronous, rate-limited archive
  submission; the database-writing reference script is not a discovery job.

On 2026-11-25, `curl` from this sandbox and the web-fetch service both failed
DNS resolution for the eScribe portal, `nwprogress.ca`,
`www.freshetnews.ca`, and `web.archive.org`. No HTTP response was received.
This is an environment limitation, **not** evidence of a Cloudflare challenge,
of source availability on GitHub Actions or Vercel, or of a working Wayback
fallback. No scheduled proof of concept is included until that can be tested.

### Follow-up implementation and acceptance checks

1. In a manually dispatched, read-only GitHub Actions probe, fetch each source
   and a concrete NWP Wayback snapshot. Log HTTP status, content type, final
   host and a bounded diagnostic (not full pages); distinguish DNS/network
   errors, 403/challenge pages, rate limits, and valid content. Inspect whether
   listings expose meeting IDs, dates, agenda and minutes links, and whether
   news discovery is reliable. Repeat from Vercel only if comparing platforms.
   Do not attempt to bypass access controls; respect source terms and rate
   limits. Record unavailable or stale sources as failures, not empty results.
2. Select parsers and an initial lookback/baseline after inspecting real
   responses. Test meeting updates, article discovery, absent/stale snapshots,
   challenge pages, and changed versus unchanged platform content using
   fixtures. A new snapshot alone is not a content change.
3. Give each review item a stable key: meeting ID plus document kind/version,
   canonical article URL, or platform URL plus normalized content digest.
   Preserve meaningful query parameters such as eScribe's meeting ID; do not
   assume all tracking parameters are safe to remove. Distinguish agenda,
   minutes and revisions. Avoid automatically merging syndicated stories
   solely by similar titles.
4. Persist the key in an issue marker and check **open and closed** issues,
   including pagination, before creating one. Serialize scheduled and manual
   runs with workflow concurrency. Reconcile after ambiguous API failures
   before retrying; issue search/indexing and manual edits can still cause
   duplicates, so document and test recovery rather than promising exactly
   once delivery. Do not mark an item seen before its issue is created.
5. Grant the discovery workflow only the permissions it needs (for example
   `issues: write`, with read-only repository access); do not provide the
   Supabase service-role key. Report per-source failures visibly so an empty
   queue cannot look like a successful scan. Test reruns, closed-item dedup,
   overlapping runs, partial failures, and human review before enabling the
   schedule. Keep the existing import workflow as the only automated database
   writer in this path.
