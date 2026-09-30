---
name: stats
description: Long-term correction trends — error rate over time, most common mistakes, improvement trajectory.
argument-hint: "[--days N]"
allowed-tools: Bash, Glob, Read
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Parse arguments and load stats

Parse `$ARGUMENTS` for `--days N` (default: 30).

```bash
node -e "
  const args = process.argv.slice(1).join(' ');
  const match = args.match(/--days\s+(\d+)/);
  const days = match ? parseInt(match[1]) : 30;
  const { periodStats, weeklyTrend } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs');
  console.log(JSON.stringify({ days, stats: periodStats(days), trend: weeklyTrend(Math.ceil(days / 7)) }));
" -- $ARGUMENTS
```

If the script fails, read JSONL files directly via Glob + Read and compute stats manually.

### Step 2: Generate report

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
{for each of top 10 stats.patterns: | N | original | corrected | count |}

## Weekly Trend

| Week | Prompts | Corrections | Error Rate |
|------|--------:|------------:|-----------:|
{for each week in trend: | start — end | total | corrections | errorRate% |}

## Analysis

{Trend verdict, using weekly error rates in order (oldest → newest):
- **Improving** if weekly error rate decreased by >5 percentage points for 2+ consecutive weeks.
- **Regressing** if weekly error rate increased by >5 percentage points for 2+ consecutive weeks.
- **Flat** otherwise.
State the verdict in one sentence with the delta, e.g. "Improving — error rate down 8% over 3 weeks."}

{Focus areas: group the full pattern list by category (spelling, grammar, punctuation, word-choice, article, preposition). Report the top 3 categories by total occurrence count. For each of those 3, list the single highest-count pattern and the category's share of total corrections as a percentage.}
```

## Examples

<example>
Context: User wants the default 30-day view of their language stats.
user: "/claude-english-buddy:stats"
assistant: "Computing the last 30 days of prompts, corrections, weekly trend, and top recurring mistakes."
</example>
<example>
Context: User wants a tighter 7-day window to see recent progress.
user: "/claude-english-buddy:stats --days 7"
assistant: "Generating a 7-day stats report with weekly trend and top patterns."
</example>
