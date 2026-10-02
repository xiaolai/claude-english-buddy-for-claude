---
name: english-buddy-today
description: "Use when the user asks for today's English report: the prompts the coaching hook corrected today, recurring mistakes, 2-3 lessons of the day, and the trend against yesterday and the last 7 days. Today only; for a longer window use $english-buddy-stats."
---

# Today's Language Report

## Locate the plugin

This file is `<root>/codex/skills/english-buddy-today/SKILL.md`. The plugin root `<root>` is the directory three levels above it; use that absolute path as `$ROOT` below. Codex does not export a plugin-root variable to skill commands.

## Step 1: Load today's data

```bash
node "$ROOT/scripts/history-report.mjs" --host codex today
```

- Exit code 3: respond "No correction history yet. The coaching hook records a prompt only after you trust it (run `/hooks` in Codex) and submit a prompt in English or another language." and STOP.
- Any other non-zero exit: show the stderr line verbatim and STOP.
- Exit 0: parse the JSON. If `today.total` is 0, respond "No prompts processed today yet." and STOP.

## Step 2: Generate the report

```markdown
# Today's Language Report — {today.date}

## Overview

| Metric | Today | Yesterday | 7-day avg |
|--------|------:|----------:|----------:|
| Prompts | {today.total} | {yesterday.total} | {week.total / 7 rounded} |
| Corrections | {today.corrections} ({today.errorRate}%) | {yesterday.corrections} ({yesterday.errorRate}%) | {week.corrections / 7 rounded} ({week.errorRate}%) |
| Translations | {today.translations} | — | — |
| Clean prompts | {today.clean} | — | — |
| Refinements (::) | {today.refinements} | — | — |

## Today's Corrections

| # | You Wrote | Corrected | Fixes |
|---|-----------|-----------|-------|
{one row per record in today.records; the Fixes cell is the record's annotations with newlines replaced by `<br>`; render the legacy `(a>b; c>d)` form verbatim}

## Recurring Patterns

| Pattern | Count Today | Status |
|---------|:-----------:|--------|
{one row per entry in today.patterns with count > 1: `original → corrected`, count, a short comment}

## Lessons of the Day

{Pick 2-3 corrections ranked by: (1) pattern count today, descending; (2) tie-break: the pattern also appears in 2+ earlier sessions; (3) tie-break: category priority grammar > article > preposition > word-choice > punctuation > spelling. For each:}

1. **{pattern name}** — {one-sentence rule}
   Wrong: "{original}"
   Right: "{corrected}"

## Trend

| Week | Error Rate | Corrections/Day |
|------|:----------:|:---------------:|
{one row per entry in trend: weekStart — weekEnd | errorRate% | avgPerDay}

{Error rate falling: "You're improving. Error rate down {delta}% in {weeks} weeks."}
{Flat: "Holding steady. Focus on your recurring patterns to break through."}
{Rising: "Error rate is up — try to slow down and re-read before submitting."}
```

Numeric columns are right-aligned integers; use `—` for a cell with no meaningful value. For the rule behind a lesson, consult `$english-buddy-grammar-fundamentals`, `$english-buddy-punctuation-rules`, or `$english-buddy-common-non-native-mistakes`.

## Example

User: "Show me today's English report." → run Step 1, then render the report. User: "Show my English report for the last 3 days." → this skill covers today only; use `$english-buddy-stats` with a 3-day window instead.
