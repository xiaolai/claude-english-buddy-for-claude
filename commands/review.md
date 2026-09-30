---
name: review
description: Deep English review of any text — commit messages, PR descriptions, docs, emails.
argument-hint: "<text or file path>"
allowed-tools: Bash, Read, AskUserQuestion
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Resolve input

| Input | Action |
|-------|--------|
| File path | Read the file. If it does not exist or cannot be read, respond "File not found: {path}" and STOP. |
| Inline text | Use directly |
| (empty) | Ask for text via AskUserQuestion |

### Step 2: Review

For texts over 5,000 words, suggest breaking into sections and reviewing one section at a time.

Analyze the text for:

1. **Grammar & Mechanics** — spelling, punctuation, tense, agreement, articles
2. **Clarity** — awkward phrasing, ambiguous sentences, wordiness
3. **Tone** — apply the per-context rubric:
   - **Commit message**: imperative mood ("Fix parser crash"), subject ≤72 chars, no trailing period, no articles at the start.
   - **PR description**: present tense, full sentences, clear Summary / Changes / Test plan sections.
   - **Documentation**: full sentences, second-person ("you") or imperative, no contractions, terminology consistent across sections.
   - **Email**: greeting line, body in full sentences, sign-off/close; match formality to recipient (first name vs. "Dear …").
   - **Inline comment / code doc**: one-line summary in imperative or present tense, ≤100 chars per line.
4. **Structure** — logical flow, paragraph breaks, transitions
5. **Technical accuracy** — correct use of technical terms

### Step 3: Report

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

{Optional improvements that aren't errors but would sound more natural.}

## Summary

{2-3 sentence assessment: what's good, what needs work, one actionable tip.}
```

## Examples

<example>
Context: User pastes a draft PR description inline and wants a deep review before posting.
user: "/claude-english-buddy:review This PR fix the parser bug and add tests for edge case"
assistant: "Reviewing the inline text for grammar, clarity, tone, structure, and technical accuracy."
</example>
<example>
Context: User wants to review a longer document saved as a file.
user: "/claude-english-buddy:review docs/release-notes.md"
assistant: "Reading docs/release-notes.md and producing a full review with corrected version, changes table, and summary."
</example>
