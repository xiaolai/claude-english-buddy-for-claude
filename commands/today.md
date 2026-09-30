---
name: today
description: Today's language report — corrections made, recurring mistakes, lessons, and improvement trend.
allowed-tools: Bash, Glob, Read
disable-model-invocation: true
---

## Workflow

### Step 1: Load today's stats and comparison data

```bash
node -e "
  const { todayStats, periodStats, weeklyTrend } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs');
  const { readDay, daysAgo } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.mjs');
  const yRecords = readDay(daysAgo(1));
  const yTotal = yRecords.length;
  const yCorrections = yRecords.filter(r => r.mode !== 'clean').length;
  const yRate = yTotal > 0 ? Math.round(yCorrections / yTotal * 100) : 0;
  console.log(JSON.stringify({
    today: todayStats(),
    yesterday: { total: yTotal, corrections: yCorrections, errorRate: yRate },
    week: periodStats(7),
    trend: weeklyTrend(4),
  }));
"
```

Parse the JSON output. If `today.total` is 0: respond "No prompts processed today yet." and STOP.

If the script fails (module not found, node error, etc.), read the JSONL files directly:
1. Use Glob to find `$CLAUDE_PLUGIN_DATA/history/*.jsonl`
2. Read today's file with Read tool
3. Count records manually and build the report from raw data

### Step 2: Generate report

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
{for each record in today.records: | N | original | corrected | fixes |}
{where `fixes` is the record's annotations joined into one cell — if annotations is multi-line `wrong → right (category)`, replace newlines with `<br>` so the table renders; if it is the legacy `(a>b; c>d)` form, render it verbatim}

## Recurring Patterns

| Pattern | Count Today | Status |
|---------|:-----------:|--------|
{for each pattern with count > 1: | `original → corrected` | count | comment |}

## Lessons of the Day

{Pick 2-3 corrections using this ranking, in order: (1) highest pattern frequency today (count desc); tie-break by (2) pattern also appears in 2+ prior sessions (broad applicability); tie-break by (3) category priority: grammar > article > preposition > word-choice > punctuation > spelling. For each:}

1. **{pattern name}** — {explanation of the rule}
   Wrong: "{original}"
   Right: "{corrected}"

## Trend

| Week | Error Rate | Corrections/Day |
|------|:----------:|:---------------:|
{for each week in trend: | weekStart — weekEnd | errorRate% | avgPerDay |}

{If error rate is decreasing: "You're improving. Error rate down {delta}% in {weeks} weeks."}
{If error rate is flat: "Holding steady. Focus on your recurring patterns to break through."}
{If error rate is increasing: "Error rate is up — try to slow down and re-read before submitting."}
```

## Examples

<example>
Context: User wants a quick summary of the corrections made during today's session.
user: "/claude-english-buddy:today"
assistant: "Loading today's correction history and comparing against yesterday and the 7-day average."
</example>
<example>
Context: User typed the today report but wants a window wider than today.
user: "/claude-english-buddy:today last 3 days"
assistant: "/claude-english-buddy:today covers today only, compared with yesterday and the 7-day average. For a 3-day window I'll run /claude-english-buddy:stats --days 3."
</example>
