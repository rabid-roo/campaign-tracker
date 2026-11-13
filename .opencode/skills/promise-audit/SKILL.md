---
name: promise-audit
description: Use when critically auditing a party's platform against what they've actually delivered — flag loopholes, "directed vs delivered" gaps, and already-broken promises. Trigger on "be critical", "audit the platform", "grade delivery".
---

# Promise audit

Critically grade a platform against real delivery. Be sceptical, but stay factual — never invent evidence.

## Lens

- **"Directed" vs "delivered"** — a motion that tells staff to do something later is not delivery. Call it out.
- **Escape hatches** — "subject to contractual obligations", "commencing [future date]", "approved in principle", "terms of reference to come".
- **Already-broken promises** — e.g. a promise to publish agendas 7 days ahead, breached on the very first meeting.
- **Vote counts + the lone opposition** — the dissenting voice is usually where the real critique is (e.g. budget centralization, reconciliation backslide).
- **Self-reported figures** — the mayor's "$8M savings" / "$600k" claims are unverified; mark them as such.

## Status mapping

- `in_progress` = action began (motion passed, staff directed)
- `not_started` = untouched
- `partially_complete` = some but not all delivered
- `cancelled` = abandoned

## Output

For each promise: exact title, status, a sharp 1-2 sentence summary citing the specific loophole/gap, plus `evidence_url` + `evidence_source` + `dated_on`. Then feed into **status-research**.
