---
version: 1
slug: "src-app-promise-id-page-tsx"
primary_target: "src/app/promise/[id]/page.tsx"
related_targets: []
---

# Promise detail — surface brief

Scope: the promise detail page (`/promise/[id]`) as the primary reading surface; the tracker index (`/`) and party tracker (`/party/[slug]`) inherit the same frame. Mode: **Read**.

Audience: a resident who just heard a claim and wants to know whether it was delivered, on a phone, in under a minute. The page must answer "was this done, and what is the source" before the reader scrolls.

## Direction contract

THESIS: This is an audit report on a campaign, not a product dashboard. The category default — rounded cards, pill badges, a card timeline — is refused outright: rows, rules and stamped findings carry everything, and nothing is enclosed in a card. One idea the surface owns: **every promise is a numbered finding with a status stamped against its recommendation**.

OWN-WORLD: Audit paper `#f4f4ef`, ink `#12161a`, one green auditing ink `#2b5f45`, one amber `#7c4a12`. Type: Archivo for headings and labels, Spectral for the reading column, Courier Prime for references, dates and counts. Zero corner radius anywhere. Hairlines run to the viewport edge; content sits on the rules instead of in boxes.

STORY: The reader learns the finding number, the claim, the status and the date of the last examination in one glance, then reads the record of instruments (agenda item, platform release) and the sources. They leave able to repeat the status and the citation.

FIRST VIEWPORT: A masthead rule with the product name and the tracker/party line. Below it, a finding head: reference number in the left margin, the promise title at 38px, the status stamp at the right. A ruled strip carries sector, last examined, goal tally and the "what In Progress means" disclosure. The opening paragraph and the platform quote follow in the reading column at 66 characters.

FORM: Findings register (auditor-general report). Chosen over the cadastral roll (bureaucratic legibility risk), the orienteering map (promises geography it does not hold), and the familiar tracker (the look being replaced). Donations kept: a printed legend before any status mark (orienteering), cancelled struck rather than coloured (cutting bench), evidence age faded by a measured step (cyclorama).

SIGNATURE: The stamped finding header plus the ruled count strip — status marks that read as printed apparatus, never as coloured pills.

Seed: seed:8b770d9a01d2b1da

## Resolved during the build

- The count strip filters the tracker: it carries `?status=` and marks the active cell with a 2px ink rule.
- The reader assessment stays a footer row under its own full-bleed rule; the finding header keeps the reference, sector, date and stamp.
- A nested `.bleed` inside the indented column overflowed the viewport; the assessment moved out of that column and `html { overflow-x: clip }` guards the remaining rules.
