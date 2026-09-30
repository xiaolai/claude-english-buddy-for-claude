---
name: claude-english-buddy-stats
description: "Use when the user asks for long-term English correction trends over N days (default 30): error rate over time, weekly trend, most common mistakes, and whether they are improving. For today alone use $claude-english-buddy-today; for all-time mistake patterns use $claude-english-buddy-mistakes."
---

# Language Stats

## Locate the plugin

This file is `<root>/codex/skills/claude-english-buddy-stats/SKILL.md`. The plugin root `<root>` is the directory three levels above it; use that absolute path as `$ROOT` below. Codex does not export a plugin-root variable to skill commands.

## Step 1: Parse the window and load stats

Take the window from the user's request: `--days N` or a phrase such as "last week" (7) or "last 3 months" (90). Default: 30. It must be a positive whole number of days.

```bash
node "$ROOT/scripts/history-report.mjs" --host codex period --days "{days}"
```

- Exit code 3: respond "No correction history yet. The coaching hook records a prompt only after you trust it (run `/hooks` in Codex) and submit a prompt." and STOP.
- Exit code 2 or any other failure: show the stderr line verbatim and STOP.
- Exit 0: parse the JSON (`days`, `stats`, `trend`).

## Step 2: Generate the report

```markdown
# Language Stats — Last {days} Days

## Summary

| Metric | Value |
|--------|------:|
| Total prompts | {stats.total} |
| Corrections made | {stats.corrections} ({stats.errorRate}%) |
| Translations | {stats.translations} |
| Refinements | {stats.refinements} |
| Clean prompts | {stats.clean} ({100 - stats.errorRate}%) |

## Top 10 Recurring Mistakes

| # | You Write | Should Be | Times |
|---|-----------|-----------|------:|
{top 10 of stats.patterns: | N | original | corrected | count |}

## Weekly Trend

| Week | Prompts | Corrections | Error Rate |
|------|--------:|------------:|-----------:|
{one row per trend entry, oldest first: | weekStart — weekEnd | total | corrections | errorRate% |}

## Analysis

{Verdict from the weekly error rates, oldest → newest:
- **Improving** if the rate fell by more than 5 percentage points for 2+ consecutive weeks.
- **Regressing** if it rose by more than 5 percentage points for 2+ consecutive weeks.
- **Flat** otherwise.
State it in one sentence with the delta, e.g. "Improving — error rate down 8% over 3 weeks."}

{Focus areas: group all patterns by category (spelling, grammar, punctuation, word-choice, article, preposition). For the top 3 categories by total count, give the single highest-count pattern and the category's share of all corrections as a percentage.}
```

## Example

User: "How has my English been over the last week?" → `--days 7`, then render the report.
