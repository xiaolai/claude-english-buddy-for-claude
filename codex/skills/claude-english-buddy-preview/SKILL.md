---
name: claude-english-buddy-preview
description: "Use when the user wants a dry run: show what WOULD be corrected in a prompt, commit message, or PR description before they submit it, without logging anything to the correction history. Runs the full grammar, tone, and clarity review and adds a what-would-change summary."
---

# Preview — Dry Run

## Step 1: Resolve the input

| Input | Action |
|-------|--------|
| Inline text | Use it directly. |
| A file path | Read the file. If it does not exist or cannot be read, respond "File not found: {path}" and STOP. |
| Nothing | Ask the user for the text, then continue. |

- Shorter than 10 characters: respond "Input too short to preview." and STOP.
- Starts with a slash command: respond "Preview does not apply to slash commands." and STOP.

## Step 2: Read the resolved config

Read `.claude-english-buddy.json` in the current directory, then `~/.claude/hooks/prompt_coach.json`; the project value wins. Note whether `auto_correct` is on (default: on). The preview runs either way.

## Step 3: Dry-run review

This is a **dry run**: do not write to the correction history, do not submit the text anywhere, and do not modify any file.

Run `$claude-english-buddy-writing-reviewer` on the input text.

## Step 4: Report

```markdown
# Preview — Dry Run

**Auto-correct is currently**: {enabled / disabled}
**This preview does NOT log, submit, or modify any history.**

---

{writing-reviewer output verbatim}

---

## What Would Change If You Submitted

| Aspect | Before | After |
|--------|--------|-------|
| Prompt length | {n chars} | {n chars} |
| Error count | {n} | 0 |
| Tone score | {1–5} | {1–5} |

## Recommendation

{Errors found = 0 AND tone score ≥ 4: "Ready to submit — no changes needed."}
{Errors found > 0 OR tone score ≤ 3: "Consider applying the corrections above before submitting."}
{A single short imperative line is a commit message: add a commit note with the ≤72-char check.}
```

## Example

User: "Preview this before I send it: refactor the autentication modul, its got too many responsibilties" → dry-run review and report; nothing is logged.
