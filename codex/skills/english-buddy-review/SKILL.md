---
name: english-buddy-review
description: "Use when the user asks for a deep English review of a piece of text or a file: a commit message, PR description, doc, README, or email. Returns a corrected version, a table of changes with the rule behind each, optional style suggestions, and one tip. For a what-would-the-hook-change dry run of a prompt use $english-buddy-preview."
---

# English Review

## Step 1: Resolve the input

| Input | Action |
|-------|--------|
| A file path | Read the file. If it does not exist or cannot be read, respond "File not found: {path}" and STOP. |
| Inline text | Use it directly. |
| Nothing | Ask the user for the text, then continue. |

For texts over 5,000 words, suggest reviewing one section at a time.

## Step 2: Review

Analyze the text for:

1. **Grammar & mechanics** — spelling, punctuation, tense, agreement, articles (`$english-buddy-grammar-fundamentals`, `$english-buddy-punctuation-rules`, `$english-buddy-common-non-native-mistakes`).
2. **Clarity** — awkward phrasing, ambiguous sentences, wordiness.
3. **Tone** — apply the per-context rubric from `$english-buddy-tone-calibration`:
   - **Commit message**: imperative mood ("Fix parser crash"), subject ≤72 chars, no trailing period, no leading article.
   - **PR description**: present tense, full sentences, Summary / Changes / Test plan sections.
   - **Documentation**: full sentences, second person or imperative, no contractions, consistent terminology (`$english-buddy-technical-writing`).
   - **Email**: greeting line, full sentences, sign-off; formality matched to the recipient.
   - **Inline comment / code doc**: one-line summary in imperative or present tense, ≤100 chars per line.
4. **Structure** — logical flow, paragraph breaks, transitions.
5. **Technical accuracy** — correct use of technical terms.

## Review discipline

- **Preserve the author's voice.** Rhythm, register, idiom, and structural habits are voice; grammar and punctuation errors, typos, and ambiguous references are not. When a fix would change voice, offer both the minimal fix and the rewrite, and let the user pick.
- **Change only what is wrong.** Every edit in the corrected version must trace to an identified error. Never replace a correct phrase with a shorter, "more idiomatic", or reordered one; put optional improvements under Style Suggestions, never in the corrected text.
- **Do not over-polish.** Surface at most three lessons in the Summary. A text with no errors gets a short "looks good", not invented improvements.

## Step 3: Report

```markdown
# English Review

**Text length**: {words} words
**Overall quality**: {Excellent / Good / Needs Work / Poor}
**Error count**: {N}

## Corrected Version

{Full corrected text}

## Changes Made

| # | Original | Corrected | Category | Explanation |
|---|----------|-----------|----------|-------------|
| 1 | ... | ... | grammar | ... |

## Style Suggestions

{Optional improvements that are not errors.}

## Summary

{2-3 sentences: what is good, what needs work, one actionable tip.}
```

For a multi-axis review with separate grammar, tone, and clarity passes, use `$english-buddy-writing-reviewer`.

## Example

User: "Review this PR description: This PR fix the parser bug and add tests for edge case" → review the inline text and render the report.
