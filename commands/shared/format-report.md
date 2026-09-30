---
description: "Shared: markdown table schemas for stats, mistakes, and today reports"
user-invocable: false
disable-model-invocation: true
---
<!-- Shared partial: format report -->
<!-- Referenced by: today, stats, mistakes. Do not use standalone. -->

## Shared Report Schemas

Commands in this plugin emit reports that share three recurring table shapes. Use these canonical schemas so reports are comparable across commands.

### Overview Table (today.md, stats.md)

Summary stats row by row, one column per time window being compared.

```markdown
| Metric | Today | Yesterday | 7-day avg |
|--------|------:|----------:|----------:|
| Prompts | {n} | {n} | {n} |
| Corrections | {n} ({rate}%) | {n} ({rate}%) | {n} ({rate}%) |
| Translations | {n} | {n} | {n} |
| Clean prompts | {n} | {n} | {n} |
| Refinements (::) | {n} | {n} | {n} |
```

Rules:

- Right-align numeric columns (`|------:|`).
- Use integers, not decimals, for counts.
- Show percentage in parentheses after the count for the Corrections row only.
- Use `—` (em-dash) when a cell has no meaningful value.

### Corrections Log (today.md, mistakes.md, drill.md)

Each row is one correction event.

```markdown
| # | You Wrote | Corrected | Pattern |
|---|-----------|-----------|---------|
| 1 | ... | ... | ... |
```

Rules:

- Column 1 is the row number, starting at 1.
- Columns 2 and 3 are the `original` and `corrected` fields from the JSONL record.
- Column 4 is the pattern label (category or named pattern like `its vs it's`).
- Truncate long strings to ~80 chars with `…`.

### Pattern Frequency (mistakes.md, stats.md)

Aggregated (original, corrected) pairs with counts.

```markdown
| # | You Write | Should Be | Times | Category |
|---|-----------|-----------|------:|----------|
| 1 | ... | ... | {n} | {category} |
```

Categories (canonical set):

- `spelling`
- `grammar` (tense, agreement, structure)
- `punctuation`
- `word-choice`
- `article`
- `preposition`

Right-align the `Times` column. Do not percent-normalize here; raw counts make patterns more comparable across periods.

### Weekly Trend (stats.md)

```markdown
| Week | Prompts | Corrections | Error Rate |
|------|--------:|------------:|-----------:|
| {start} — {end} | {n} | {n} | {rate}% |
```

Rules:

- Week key is ISO date `YYYY-MM-DD — YYYY-MM-DD` using Monday–Sunday boundaries.
- Order rows oldest → newest (chronological) so the reader sees direction at a glance.

### Trend Verdict

Every report that spans multiple days should end with a one-line verdict:

| Condition | Verdict |
|-----------|---------|
| Weekly error rate dropped >5 percentage points for 2+ consecutive weeks | `Improving — error rate down {delta}% over {weeks} weeks.` |
| Weekly error rate rose >5 percentage points for 2+ consecutive weeks | `Regressing — error rate up {delta}% over {weeks} weeks.` |
| Otherwise | `Flat — hold the line; focus on recurring patterns to break through.` |

### Lessons Section (today.md)

When picking 2–3 lessons from the day, rank by:

1. Highest pattern frequency today (count descending)
2. Tie-break: pattern also appears in 2+ prior sessions (broad applicability)
3. Tie-break: category priority: `grammar > article > preposition > word-choice > punctuation > spelling`

Render each lesson as:

```markdown
1. **{pattern name}** — {one-sentence rule explanation}
   Wrong: "{original}"
   Right: "{corrected}"
```

### Focus Areas Section (stats.md, mistakes.md)

Group the full pattern list by category. For the top 3 categories by total occurrences, list the single highest-count pattern and the category's share of total corrections as a percentage.
