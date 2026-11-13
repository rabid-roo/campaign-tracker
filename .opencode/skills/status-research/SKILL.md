---
name: status-research
description: Use when researching whether a government/council is acting on campaign promises and recording the findings into the tracker (status:merge + status:import). Trigger on "research promises", "check status", "is X being acted on".
---

# Status research

Research whether a party is delivering on campaign promises, then import the findings.

## Loop

```
research agent → JSON → status:merge → data/status/updates.json → status:import → Supabase
```

The research agent has **no DB access** — it only returns JSON. Import happens locally with the `SUPABASE_SERVICE_ROLE_KEY`.

## Agent JSON schema

```json
[
  {
    "party": "new-west-progressives",
    "promise": "<exact title>",
    "status": "in_progress | completed | not_started | partially_complete | cancelled",
    "summary": "<1-2 factual sentences>",
    "evidence_url": "<URL of agenda/release/article>",
    "evidence_source": "<short label, e.g. '2026-11-06 Special Council agenda item 2.8'>",
    "dated_on": "2026-11-06"
  }
]
```

## Steps

1. Save the agent's JSON to a file.
2. `npm run status:merge -- path/to/agent-output.json`
3. `npm run status:import`

## Rules

- `party` is the slug from `scripts/itemize/config.ts`.
- `promise` must match a title verbatim (or use the promise UUID).
- `status` is one of the enum values.
- Only mark a status when there's a linkable source.
- `status:merge` dedupes by `party+promise+status+summary`.
- If `data/status/updates.json` has a UTF-8 BOM, strip it first (`status:merge` crashes on `JSON.parse`).

## Status semantics

- `in_progress` — action actually began (motion passed, staff directed, budget allocated)
- `not_started` — untouched (a promise merely "discussed" on an agenda with no outcome is still `not_started`)
- `partially_complete` — some but not all delivered
- `completed` — fully delivered
- `cancelled` — abandoned
