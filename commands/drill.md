---
name: drill
description: Spot-quiz on your top recurring English mistakes — presents one sentence per drill round with an intentional error matching your top-3 mistake categories, then asks you to correct it. Learning tool, not an evaluator.
argument-hint: "[--category <name>] [--rounds N]"
allowed-tools: Bash, Read, Glob, AskUserQuestion
model: sonnet
disable-model-invocation: true
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Parse arguments

| Flag | Default | Meaning |
|------|---------|---------|
| `--category <name>` | (none) | Restrict drill to one category: spelling / grammar / punctuation / word-choice / article / preposition |
| `--rounds N` | 3 | How many drill sentences to generate |

### Step 2: Load all-time mistake patterns

Use the shared JSONL parser pattern (see `${CLAUDE_PLUGIN_ROOT}/commands/shared/jsonl-parser.md`) to read correction history.

```bash
node -e "
  const { periodStats } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs');
  console.log(JSON.stringify(periodStats(365)));
"
```

If the script fails, read JSONL files directly via `Glob` + `Read` following the fallback pattern in `${CLAUDE_PLUGIN_ROOT}/commands/shared/jsonl-parser.md`.

If the user has fewer than 5 corrections total across all time, respond: "Not enough history yet to drill. Use Claude Code for a few days first, then try `/claude-english-buddy:drill` again." and STOP.

### Step 3: Identify top-3 categories

Group all corrections by category (spelling, grammar, punctuation, word-choice, article, preposition). Rank by total count. Take the top 3.

If `--category` was passed, use that single category instead.

### Step 4: Generate drill sentences

For each of the N rounds (default 3):

1. Pick a category from the top-3 (round-robin across rounds if 3; otherwise random from filtered set).
2. Pick a specific pattern the user has made inside that category (e.g. `its got → it has`).
3. Generate ONE new sentence that uses the wrong form of that pattern. The sentence should:
   - Be a plausible developer-context sentence (commit message, PR description, doc blurb, error message).
   - Contain exactly ONE intentional error matching the target pattern.
   - Not repeat a sentence the user has seen before (if possible).
4. Present the sentence and ask the user to correct it.

### Step 5: Present drill

```markdown
# Drill Round {1 of N} — Category: {category}

Your recurring pattern: **{original → corrected}** (seen {count} times)

## The Sentence

> {generated sentence with the intentional error}

Rewrite this sentence to fix the error. Reply with the corrected version; I'll grade your answer and show the rule.
```

After the user replies with a corrected sentence, grade it:

```markdown
## Grading — Round {N}

| | Target pattern | Your correction | Verdict |
|-|----------------|-----------------|---------|
| Original | {sentence with error} | — | — |
| Expected | {sentence with fix} | — | — |
| You wrote | — | {user's answer} | {Correct / Partial / Incorrect} |

### Rule

{One-sentence explanation of the underlying rule — pulled from the reference skill that covers the target category: grammar-fundamentals, punctuation-rules, or common-non-native-mistakes.}

{If user got it correct: brief reinforcement.}
{If partial: name the thing they missed.}
{If incorrect: state the rule and show the minimal edit.}
```

After N rounds, emit a summary:

```markdown
## Drill Summary

| Round | Category | Verdict |
|-------|----------|---------|
| 1 | ... | Correct |
| 2 | ... | Partial |
| 3 | ... | Incorrect |

**Score**: {n/N correct, n/N partial, n/N incorrect}
**Weakest pattern today**: {pattern}
**One tip**: {actionable guideline from the underlying skill}
```

## Notes

- This is a learning tool. Be encouraging. If the user gets all answers wrong, do not pile on; focus on one pattern to work on.
- Do not log drill attempts to the JSONL correction history — they are practice, not real usage.
- Grading uses string comparison for the TARGET pattern only. If the user makes OTHER edits (stylistic rewrites), accept them as long as the reply contains the target pattern's corrected form.
- If `--category` names a category the user has zero mistakes in, fall back to their actual top category and note the fallback in the first round header.

## Examples

<example>
Context: User has 30+ days of correction history and wants active practice on their blind spots.
user: "/claude-english-buddy:drill"
assistant: "Loading your top-3 recurring mistake categories and generating a drill sentence."
</example>
<example>
Context: User wants to focus a drill on just one category.
user: "/claude-english-buddy:drill --category article"
assistant: "Running a drill round focused on article errors from your history."
</example>
