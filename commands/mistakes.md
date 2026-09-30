---
name: mistakes
description: Your top recurring English mistakes — all-time patterns that need attention.
argument-hint: "[--top N]"
allowed-tools: Bash, Glob, Read
disable-model-invocation: true
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Load all-time patterns

Parse `$ARGUMENTS` for `--top N` (default: 20).

```bash
node -e "
  const args = process.argv.slice(1).join(' ');
  const match = args.match(/--top\s+(\d+)/);
  const topN = match ? parseInt(match[1]) : 20;
  const { periodStats } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs');
  const stats = periodStats(365);
  stats.patterns = stats.patterns.slice(0, topN);
  console.log(JSON.stringify({ topN, ...stats }));
" -- $ARGUMENTS
```

If the script fails, read JSONL files directly via Glob + Read and extract patterns manually.

### Step 2: Generate report

```markdown
# Recurring Mistakes

**Period**: All time ({total} prompts, {corrections} corrections)

## Top {topN} Patterns

| # | You Write | Should Be | Times | Category |
|---|-----------|-----------|------:|----------|
{for each pattern: | N | original | corrected | count | category |}

Categories: spelling, grammar (tense/agreement/structure), punctuation, word-choice, article, preposition

## Focus Areas

{Group the top patterns by category. For the top 3 categories:}

### {Category 1}: {count} total occurrences

{Explain the underlying rule with 2-3 examples from the user's actual mistakes.}

### {Category 2}: {count} total occurrences

{Same format.}

### {Category 3}: {count} total occurrences

{Same format.}
```

## Examples

<example>
Context: User wants the default top-20 all-time recurring mistakes.
user: "/claude-english-buddy:mistakes"
assistant: "Loading all-time correction history and ranking your top 20 recurring patterns by frequency."
</example>
<example>
Context: User wants only the top 5 patterns to focus on.
user: "/claude-english-buddy:mistakes --top 5"
assistant: "Showing your top 5 recurring mistakes grouped by category with focus areas."
</example>
