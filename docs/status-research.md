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
