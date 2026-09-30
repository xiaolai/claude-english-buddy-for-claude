---
name: claude-english-buddy-mistakes
description: "Use when the user asks for their top recurring English mistakes across all their history (default top 20), grouped by category with the rule behind each. For a dated trend use $claude-english-buddy-stats; to practise the mistakes use $claude-english-buddy-drill."
---

# Recurring Mistakes

## Locate the plugin

This file is `<root>/codex/skills/claude-english-buddy-mistakes/SKILL.md`. The plugin root `<root>` is the directory three levels above it; use that absolute path as `$ROOT` below. Codex does not export a plugin-root variable to skill commands.

## Step 1: Load all-time patterns

Take `--top N` from the user's request (a phrase such as "my top 5" also counts). Default: 20.

```bash
node "$ROOT/scripts/history-report.mjs" --host codex period --days 365 --top "{topN}"
```

- Exit code 3: respond "No correction history yet. The coaching hook records a prompt only after you trust it (run `/hooks` in Codex) and submit a prompt." and STOP.
- Exit code 2 or any other failure: show the stderr line verbatim and STOP.
- Exit 0: parse the JSON (`top`, `stats`).

## Step 2: Generate the report

```markdown
# Recurring Mistakes

**Period**: All time ({stats.total} prompts, {stats.corrections} corrections)

## Top {top} Patterns

| # | You Write | Should Be | Times | Category |
|---|-----------|-----------|------:|----------|
{one row per entry in stats.patterns: | N | original | corrected | count | category |}

Categories: spelling, grammar (tense/agreement/structure), punctuation, word-choice, article, preposition

## Focus Areas

{Group the patterns by category. For each of the top 3 categories:}

### {Category}: {count} total occurrences

{Explain the underlying rule with 2-3 examples from the user's own mistakes.}
```

Use the embedded `category` when a pattern has one; otherwise classify it yourself. Take the rule from `$claude-english-buddy-grammar-fundamentals`, `$claude-english-buddy-punctuation-rules`, or `$claude-english-buddy-common-non-native-mistakes`.

## Example

User: "What English mistakes do I keep making? Just the top 5." → `--top 5`, then render the report.
