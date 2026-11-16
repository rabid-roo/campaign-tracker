---
name: Campaign Promise Tracker
description: Delivery findings on election promises, set as an audit register
colors:
  paper: "#f4f4ef"
  paper-raised: "#fbfbf8"
  ink: "#12161a"
  muted: "#59615a"
  rule: "#c9ccc4"
  rule-strong: "#8f978d"
  accent: "#2b5f45"
  accent-soft: "#e2ece4"
  alert: "#7c4a12"
  alert-soft: "#f2e6d2"
  slate: "#2f3a44"
  hover: "#ecede7"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5.4vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.2vw, 2.35rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  row:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.14em"
  reference:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
  stamp:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.13em"
  stamp-lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    letterSpacing: "0.13em"
rounded:
  all: "0px"
spacing:
  row: "1rem"
  gutter: "1.5rem"
  section: "3rem"
components:
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.all}"
    padding: "0.3rem 0.5rem 0.26rem"
  stamp-complete:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.all}"
    padding: "0.3rem 0.5rem 0.26rem"
  stamp-lead:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.all}"
    padding: "0.5rem 0.7rem 0.45rem"
  planmark:
    textColor: "{colors.slate}"
    rounded: "{rounded.all}"
  label:
    textColor: "{colors.muted}"
  ledger-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "1rem 0.25rem"
  source-link:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.all}"
    height: "44px"
  vote-control:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.all}"
    height: "44px"
    padding: "0 0.75rem"
---

# Design System: Campaign Promise Tracker

## Overview

**Creative North Star: "The Findings Register"**

The product is an audit of a campaign, and the interface is that audit's report. It is a document to be read, not a dashboard to be operated: findings numbered in the margin, a verdict stamped against each one, evidence entered as instruments in a register. The anti-reference is the card-and-pill tracker the project replaced — rounded surfaces, coloured chips, a timeline of cards.

Three faces carry the record. Archivo prints titles, labels and navigation; Spectral carries everything the reader actually reads; Courier Prime sets references, dates and counts. They meet on one sheet: a light paper ground that goes dark with the system scheme, rules that run to the viewport edge, and no container ever drawn as a card.

**Key Characteristics:**
- Paper and ink first; auditing green and amber only where status means something.
- Status printed as a stamp with a second shape cue (outline, hatch, fill, strike), never colour alone.
- Zero corner radius anywhere; the only curves are glyphs.
- Numbered findings in a margin, ruled ledger rows, a register of sources.
- Two voices per page: Archivo for apparatus, Spectral for prose at a 33rem measure.

## Colors

A paper sheet with two meaning-bearing inks: auditing green and amber. Everything else is text weight, from muted labels down to the hairline rule.

### Primary
- **Auditing Green** (`#2b5f45`): delivered (`completed`) and partial delivery, and every outbound source link. On dark it lifts to `#93c8a8`; its tint `--accent-soft` (`#e2ece4` light, `#1b2a20` dark) backs the partial stamp.
- **Paper** (`#f4f4ef`): the sheet itself; the finding stamp prints in it when filled with green. Dark ground is `#0f1210`, with raised surfaces at `#141814`.

### Secondary
- **Delivery Amber** (`#7c4a12`): action begun (`in_progress`), carried with a 45° hatch. Dark value `#d5a05c`; tint `--alert-soft` (`#f2e6d2` light, `#2a2216` dark).

### Neutral
- **Ink** (`#12161a`): titles, body copy, stamp borders that mean "not started", focus rings. Dark ink is `#e9ece6`.
- **Muted Register** (`#59615a`): labels, secondary prose, cancelled; dark `#9aa49a`. Outline-only stamps border in this, not in the strong rule, so the shape cue clears 3:1.
- **Hairline** (`#c9ccc4`) and **Strong Rule** (`#8f978d`): row dividers and section rules vs. the boundaries that must be seen — the masthead rule, plan-mark underline, scrollbar. Dark values `#2b322b` and `#4c554c`.
- **Slate** (`#2f3a44`): plan-tag marks only; dark `#b8c3cb`.
- **Hover Ground** (`#ecede7`): ledger-row hover and focus-within; dark `#171c17`.

### Named Rules
**The Second Cue Rule.** Colour never carries status alone. In progress hatches, cancelled strikes through, completed fills, not started stays an outline. A reader who cannot separate green from amber still reads the verdict.

**The Rationed Ink Rule.** Green and amber appear only on status, sources, and the selection highlight. Nothing decorative gets the accent.

## Typography

**Display Font:** Archivo (with system-ui, sans-serif)
**Body Font:** Spectral (with Georgia, serif)
**Reference Font:** Courier Prime (with ui-monospace, monospace)

**Character:** Archivo is the auditor's hand — blunt, uppercase, tracked like stamped apparatus. Spectral is the report's prose, set for a phone in a short session. Courier Prime is the register's instrument: reference numbers, dates, counts, plan marks.

### Hierarchy
- **Display** (700, `clamp(2.3rem, 5.4vw, 3.6rem)`, 1.03, `-0.02em`): tracker masthead only.
- **Title** (700, `clamp(1.75rem, 3.2vw, 2.35rem)`, 1.1): the finding's title on the promise page.
- **Row** (600, `1.05–1.35rem`, 1.35): promise titles in the ledger.
- **Body** (400, `1.0625rem`, 1.6): all prose, capped at 33rem (about 66 characters) with `text-wrap: pretty`.
- **Label** (600, `0.6875rem`, `0.14em`, uppercase): field names, section headers, table columns. The smallest voice on the sheet.
- **Reference** (400, `0.8–0.95rem`, tabular figures): dates, counts, finding numbers, plan marks.
- **Stamp** (600, `0.6875rem`, `0.13em`, uppercase): instrument rows and target tallies. **Stamp lead** (`0.95rem`, 2px border) is the finding's own verdict.
- **Stated record** (`1.0625rem`): the platform quote, set on the reading measure in straight quotes so it cannot be mistaken for the site's summary.

### Named Rules
**The Two Voices Rule.** Archivo never sets a paragraph and Spectral never sets a label. Mixed families in one block are a register break.

**The Measure Rule.** Prose holds 33rem. Rules and data may run wider; sentences do not.

## Layout

Content sits in a 72rem column (`max-w-6xl`) with `1.5rem` gutters (`2rem` from `md`). The promise page reserves a 7rem left margin from `md` for the finding number and plan mark, and runs its 33rem reading column one gutter to the right, so every ruled block starts on the title's edge.

Rules are full-bleed by design: the `.bleed` pseudo-element draws a hairline from viewport edge to edge, and `html { overflow-x: clip }` keeps those rules from creating scroll. There is no card grid anywhere. The rhythm is `1rem` between rows, `3rem` between sections; the finding strip and count strip divide into four and six equal cells on desktop and stack into label/value rows on phones.

### Named Rules
**The No-Card Rule.** A boundary is a rule or space, never a rounded box with a shadow. If a group needs separation, draw its top rule and leave the sheet visible between groups.

## Elevation & Depth

Flat. Depth is information architecture, not shadow: the sheet, the rule, and the stamp. No box-shadow, no blur, no glass, no translucency except the 12% hatch inside the in-progress stamp. Loading depth comes from ruled skeleton rows (`--rule` at 40–50%), not from spinners or shimmer.

## Shapes

Zero radius is a system rule, not an omission: stamps, buttons, count strip, ledger rows and the vote control are all square-cornered. Borders are `1px` hairlines, `1.5px` on stamps, `2px` on the stamp lead, the count strip's active cell and the masthead rule. The `<details>` marker is a printed `+` / `−` in Courier, never a browser triangle. Selection takes auditing green on paper; the caret is ink; scrollbars use the strong rule — browser chrome is part of the sheet.

## Components

### Status stamp
- **Shape:** rectangle, `1.5px` current-color border, padding `0.3rem 0.5rem 0.26rem`.
- **Variants:** `stamp-none` (muted outline), `stamp-progress` (amber with 45° hatch), `stamp-partial` (green on `--accent-soft`), `stamp-complete` (paper on green, filled), `stamp-cancelled` (muted outline plus strike-through).
- **Stamp lead:** the finding's verdict at `0.95rem`, `2px` border, padding `0.5rem 0.7rem 0.45rem`; instrument and target rows keep the 11px stamp.

### Plan mark
Uppercase Courier at `0.6875rem`, `0.08em` tracking, slate ink, `1px` strong-rule underline. Never a pill, never filled.

### Ledger row
Full-width grid row (reference column + content) with a top hairline; hover and focus-within set `--hover`, no border on the outside; at phone width the grid collapses and the reference shortens.

### Count strip
Six cells — all findings plus the five statuses — each a Courier count over a label, `1px` rules between cells, active cell marked by a 2px ink top border. It filters the tracker in place.

### Finding strip (promise page)
Four cells — Last examined, Source, Area, Targets met — value over label from `sm`, label/value row on phones. Source is a `SourceLink`, placed second so the citation clears the phone fold.

### Source link
One affordance for every citation: accent uppercase at `0.8rem`, `0.08em` tracking, ruled underline at 40% accent, and a `13px` outbound arrow inside the link's own box so truncation cannot clip it. Minimum 44px tall on touch, auto-height from `sm`. Truncation is expected — the host still reads.

### Vote control
"Is this record accurate?" with two square-cornered 44px-high buttons labelled Yes and No (thumbs set at 1.6 stroke), beside a Courier net count that reads "No marks yet" at zero. Pressed state fills ink with paper text; `aria-disabled` dims during the request. An always-mounted `role="status"` line sits absolutely below so a failure announces without moving the row.

### Section header and disclosure
Section headers are `.label` only — no large section titles, no numeral counters. The disclosure is a `<details>` whose summary carries a Courier `+` / `−` marker; it holds the status definition, kept out of the reading flow until asked for.

## Do's and Don'ts

### Do:
- **Do** set status as a stamp, with a second cue beyond colour (hatch, strike, fill, outline).
- **Do** draw rules edge to edge with `.bleed`; keep `html { overflow-x: clip }` so they cannot scroll the page.
- **Do** keep prose on the 33rem measure with `text-wrap: pretty`; let rules and data run wider.
- **Do** keep Courier Prime for references, dates and counts only.
- **Do** keep touch targets at 44px minimum (nav links, source links, vote buttons, disclosure summary).
- **Do** route every citation through `SourceLink` so the outbound mark and truncation behave the same everywhere.
- **Do** style selection, caret and scrollbar from the palette; they are part of the sheet.

### Don't:
- **Don't** reintroduce pills, chips or rounded badges.
- **Don't** enclose content in cards or add border-radius; the system sells 0px.
- **Don't** add shadows, gradients or hover lifts; the sheet does not float.
- **Don't** run prose past 33rem or set a paragraph in Archivo.
- **Don't** let colour alone carry a status; always pair it with the shape cue.
