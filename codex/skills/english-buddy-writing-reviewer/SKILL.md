---
name: english-buddy-writing-reviewer
description: "Use for a thorough, multi-axis English-quality review of a README, PR description, doc, or email, including whether it sounds professional: runs the grammar, tone, and clarity specialist skills on the same text and merges their findings into one report with a corrected version, a changes table, and a tone score. For a single axis use $english-buddy-grammar-checker, $english-buddy-tone-calibrator, or $english-buddy-clarity-enhancer."
---

# Writing Review

You orchestrate the review. Beyond classifying the context and merging results, the three specialist skills do the analysis:

| Specialist skill | Handles |
|------------------|---------|
| `$english-buddy-grammar-checker` | spelling, agreement, tense, articles, prepositions, punctuation, L2 patterns |
| `$english-buddy-tone-calibrator` | tone fit per context (commit / PR / doc / comment / email / chat) |
| `$english-buddy-clarity-enhancer` | run-on sentences, ambiguous references, nested clauses, terminology drift |

## Process

1. **Resolve the input.** If it is a file path, read the file and use its contents; otherwise use the text as given. If there is no text, ask the user for it.
2. **Classify the context** from the input's shape, unless the user named it:
   - Single short imperative line → `commit`
   - Block with `## Summary` / `## Changes` / `## Test plan` → `pr`
   - Headings, paragraphs, cross-references → `doc`
   - Opens with a greeting, ends with a sign-off → `email`
   - Code comment block (`//`, `/* */`, `#`) → `comment`
   - Short informal text with no structure → `chat`
3. **Run the three specialists on the same text.** If the runtime can run subagents in parallel, give each specialist to its own subagent; otherwise run them one after another in the order above. The merged report is the same either way. Pass `$english-buddy-tone-calibrator` the context type too.
4. **Merge** the three findings tables into the report below. Deduplicate overlaps: a punctuation error flagged by both grammar and clarity appears once, under grammar.

If a specialist fails, say so in the Summary and merge the other two.

## Review discipline

- **Preserve the author's voice.** Rhythm, register, idiom, and structural habits are voice; grammar and punctuation errors, typos, and ambiguous references are not. When a fix would change voice, offer both the minimal fix and the rewrite.
- **Change only what is wrong.** Every edit in the corrected version traces to a specialist finding. Optional improvements go under Style Suggestions, never into the corrected text.
- **Do not over-polish.** The Summary names at most three lessons. Clean text gets a short "looks good".

## Output Format

```markdown
## English Review

**Text length**: {words} words
**Context**: {commit / pr / doc / comment / email / chat}
**Overall quality**: {Excellent / Good / Needs Work / Poor}
**Errors found**: {N}
**Tone score**: {1–5} / 5

### Corrected Version

{Full corrected text. Apply grammar-checker fixes verbatim; apply tone-calibrator adjustments only if the tone score is ≤3; apply clarity-enhancer restructuring only for HIGH severity.}

### Changes

| # | Original | Corrected | Category | Why |
|---|----------|-----------|----------|-----|
| 1 | ... | ... | grammar | ... |
| 2 | ... | ... | tone | ... |
| 3 | ... | ... | clarity | ... |

### Style Suggestions

{Non-error improvements from tone-calibrator (score 4) and clarity-enhancer (LOW / MEDIUM).}

### Summary

{2–3 sentences: strengths, weaknesses, one tip. Start with what is good; the user is learning.}
```

## Quality Banding

| Errors | Tone score | Banding |
|--------|------------|---------|
| 0 | 5 | Excellent |
| 1–2 | ≥4 | Good |
| 3–5 OR tone 3 | — | Needs Work |
| 6+ OR tone ≤2 | — | Poor |

Explain each rule briefly — "use `the` before specific nouns", not just "add `the`".

## Example

Input (commit message draft): `fix a bug in the parser that cause crash when input is empty, also updated the tests`

- grammar-checker: `cause` → `causes` (agreement).
- tone-calibrator (context `commit`, score 2/5): past tense "updated" in a commit; conversational filler.
- clarity-enhancer: run-on joining two changes.

Merged corrected version: `Fix parser crash on empty input; update tests.` — Needs Work, 3 errors, tone 2/5, tip: answer "what does this change do?" in 5–10 imperative words.
