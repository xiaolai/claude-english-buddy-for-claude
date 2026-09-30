---
name: claude-english-buddy-drill
description: "Use when the user wants to practise their recurring English mistakes: a spot-quiz that shows one developer-context sentence per round with an intentional error from their top-3 mistake categories, asks them to correct it, then grades the answer and states the rule. A learning tool, not an evaluator of their own text; to review text use $claude-english-buddy-review."
---

# English Drill

## Locate the plugin

This file is `<root>/codex/skills/claude-english-buddy-drill/SKILL.md`. The plugin root `<root>` is the directory three levels above it; use that absolute path as `$ROOT` below. Codex does not export a plugin-root variable to skill commands.

## Step 1: Parse options

| Option | Default | Meaning |
|--------|---------|---------|
| `--category <name>` | none | Drill one category: spelling / grammar / punctuation / word-choice / article / preposition |
| `--rounds N` | 3 | Number of drill sentences |

Take them from the user's request; plain phrasing such as "five rounds on articles" counts.

## Step 2: Load all-time mistake patterns

```bash
node "$ROOT/scripts/history-report.mjs" --host codex period --days 365
```

- Exit code 3, or fewer than 5 corrections in `stats.corrections`: respond "Not enough history yet to drill. Keep using Codex with the coaching hook trusted for a few days, then ask for a drill again." and STOP.
- Any other non-zero exit: show the stderr line verbatim and STOP.

## Step 3: Pick the top-3 categories

Group `stats.patterns` by category (use the embedded `category`; classify it yourself when missing) and rank by total count. Take the top 3. If `--category` names a category with zero mistakes, fall back to the actual top category and say so in the first round's header.

## Step 4: Run the rounds

For each round:

1. Pick a category (round-robin across the top 3; the single category if `--category` was given).
2. Pick one of the user's own patterns in that category (for example `its got → it has`).
3. Write ONE new, plausible developer-context sentence (commit message, PR description, doc blurb, or error message) containing exactly one intentional error of that pattern. Do not reuse a sentence the user has already seen in this drill.
4. Present it and wait for the user's reply:

```markdown
# Drill Round {n} of {N} — Category: {category}

Your recurring pattern: **{original → corrected}** (seen {count} times)

> {sentence with the intentional error}

Rewrite this sentence to fix the error. Reply with the corrected version; I'll grade it and show the rule.
```

5. Grade the reply on the target pattern only: accept other stylistic edits as long as the target's corrected form is present.

```markdown
## Grading — Round {n}

| | Sentence | Verdict |
|-|----------|---------|
| Original | {sentence with error} | — |
| Expected | {sentence with fix} | — |
| You wrote | {user's answer} | {Correct / Partial / Incorrect} |

### Rule

{One sentence from $claude-english-buddy-grammar-fundamentals, $claude-english-buddy-punctuation-rules, or $claude-english-buddy-common-non-native-mistakes. Correct: brief reinforcement. Partial: name what was missed. Incorrect: the rule and the minimal edit.}
```

## Step 5: Summary

```markdown
## Drill Summary

| Round | Category | Verdict |
|-------|----------|---------|
| 1 | ... | Correct |

**Score**: {n correct, n partial, n incorrect out of N}
**Weakest pattern today**: {pattern}
**One tip**: {an actionable guideline from the rule's skill}
```

## Notes

- Be encouraging. If every answer is wrong, focus on one pattern instead of listing all failures.
- Do not write drill attempts to the correction history; they are practice, not real prompts.
