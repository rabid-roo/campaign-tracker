---
name: Campaign Promise Tracker
description: Delivery findings on election promises, set as an audit register.
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
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3.6rem"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.35rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
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
rounded:
  all: "0px"
spacing:
  gutter: "1.5rem"
  section: "3rem"
  row: "1rem"
components:
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.alert}"
    rounded: "{rounded.all}"
    padding: "0.3rem 0.5rem 0.26rem"
  stamp-complete:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.all}"
    padding: "0.3rem 0.5rem 0.26rem"
  planmark:
    textColor: "{colors.slate}"
    rounded: "{rounded.all}"
  ledger-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "1rem 0.25rem"
---

# Design System: Campaign Promise Tracker

## Overview

The product is an audit of a campaign, and the interface is that audit's report. It is a document to be read, not a dashboard to be operated: findings numbered in the margin, status stamped against each one, evidence entered as instruments in a register. The anti-reference is the card-and-pill tracker the project replaced — rounded surfaces, coloured chips, a timeline of cards.

Three faces carry the record: Archivo for titles, labels and navigation; Spectral for everything the reader actually reads; Courier Prime for references, dates and counts.

## Colors

Paper `#f4f4ef`, ink `#12161a`, and two inks that mean something: auditing green `#2b5f45` for delivered and partial, amber `#7c4a12` for in progress. `#59615a` is the muted register of labels and secondary prose; `#c9ccc4` is the hairline, `#8f978d` the stronger rule used where a boundary must be seen.

Dark ground is `#0f1210` with ink `#e9ece6`; green lifts to `#93c8a8` and amber to `#d5a05c` so both keep text contrast. Status is never carried by colour alone: in progress carries a 45° hatch, cancelled a strike-through, completed a solid fill, not started an outline only.

## Typography

| Role | Face | Size / weight |
|---|---|---|
| Display | Archivo | `clamp(2.3rem, 5.4vw, 3.6rem)` / 700, `-0.02em` |
| Finding title | Archivo | `clamp(1.75rem, 3.2vw, 2.35rem)` / 700, `1.1` |
| Row title | Archivo | `1.05–1.35rem` / 500–600 |
| Reading | Spectral | `1.0625rem` / 400, `1.6` |
| Label | Archivo | `0.6875rem` / 600, `0.14em`, uppercase |
| Reference | Courier Prime | `0.8–0.95rem`, `tabular-nums` |

Prose holds a 33rem measure (about 66 characters at 17px). Labels are the world's smallest voice and always uppercase-tracked; references are the only place numerals appear.

## Layout

Content sits in a 72rem column with 1.5–2rem gutters. The promise page reserves a 7rem left margin for the finding number and plan mark and runs the reading column one gutter to its right, so every ruled block starts on the title's edge. Rules are full-bleed: the `.bleed` pseudo-element draws a hairline from viewport edge to edge, and `html { overflow-x: clip }` keeps those rules from creating scroll. There is no card grid anywhere; spacing rhythm is `1rem` between rows, `3rem` between sections.

## Elevation & Depth

Flat. Depth is information architecture, not shadow: the sheet, the rule, and the stamp. No box-shadow, no blur, no glass, no translucency except the 12% hatch inside the in-progress stamp.

## Shapes

Zero radius is a system rule, not an omission: stamps, buttons, count strip, ledger rows and the vote control are all square-cornered. The only curved marks on the site are glyphs inside buttons.

## Components

- **Status stamp** (`.stamp`): 1.5px current-color border, uppercase Archivo, `0.13em`; variants `stamp-none`, `stamp-progress` (hatched), `stamp-partial`, `stamp-complete` (filled), `stamp-cancelled` (struck).
- **Plan mark** (`.planmark`): uppercase Courier with a 1px underline; never a pill.
- **Ledger row**: full-width grid row with a top hairline, hover/focus-within background `--hover`, no border on the outside.
- **Count strip**: six cells — all findings plus the five statuses — each `refnum` count over a label, active cell marked by a 2px ink top border. It filters the tracker.
- **Vote control**: two square-cornered 44px-high buttons labelled *Accurate* / *Inaccurate* beside a mono net count, pressed state filled with ink; an always-mounted `role="status"` line sits absolutely below so a failure announces without moving the row.
- **Section label** (`.label`): the only section heading style; no large section titles, and no numeral counters beside them.

## Do's and Don'ts

- Do set status as a stamp; don't reintroduce pills, chips or rounded badges.
- Do draw rules edge to edge; don't enclose content in cards.
- Do keep the reading column at 33rem; don't let prose run the full 72rem.
- Do let colour carry meaning only alongside a second cue (hatch, strike, fill, outline).
- Do keep Courier Prime for references, dates and counts only; never for running text or headings.
- Don't add shadows, gradients or hover lifts; the sheet does not float.
