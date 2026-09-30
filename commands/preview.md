---
name: preview
description: Dry-run review — show what WOULD be corrected in a prompt WITHOUT submitting it or triggering auto-correction. Useful before important prompts, commit messages, or PR descriptions.
argument-hint: "<text to preview>"
allowed-tools: Bash, Read, Task, AskUserQuestion
model: sonnet
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Resolve input

| Input | Action |
|-------|--------|
| Inline text | Use directly |
| (empty) | Ask for text via AskUserQuestion |
| File path | Read the file. If it does not exist or cannot be read, respond "File not found: {path}" and STOP. |

### Step 2: Load resolved config

Load the resolved config per `${CLAUDE_PLUGIN_ROOT}/commands/shared/config-loader.md`. If `auto_correct` is `false`, note this in the report — preview still runs regardless.

### Step 3: Dry-run review

This is a **dry run**. Do NOT:

- Log anything to the JSONL history.
- Submit the corrected text anywhere.
- Trigger the UserPromptSubmit hook.

Dispatch the `writing-reviewer` agent via the `Task` tool with the input text. The orchestrator will fan out to `grammar-checker`, `tone-calibrator`, and `clarity-enhancer` as usual.

### Step 4: Report

Use the writing-reviewer's output verbatim, but prepend a preview banner and append a "what would change" diff.

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

{If Errors found == 0 AND Tone score >= 4: "Ready to submit — no changes needed."}
{If Errors found > 0 OR Tone score <= 3: "Consider applying the corrections above before submitting."}
{If the text is a commit message (single short imperative line): add a commit-specific note with the ≤72 char check.}
```

## Notes

- This command is purely informational; it never mutates state.
- If the input is shorter than 10 characters, skip the review and respond: "Input too short to preview."
- If the input starts with a slash command, skip and respond: "Preview does not apply to slash commands."

## Examples

<example>
Context: User is about to submit a high-stakes prompt and wants to see corrections first.
user: "/claude-english-buddy:preview refactor the autentication modul, its got too many responsibilties"
assistant: "I'll run a preview review and show you what would be corrected before you submit."
</example>
<example>
Context: User drafted a commit message and wants a dry-run of the hook's corrections.
user: "/claude-english-buddy:preview Fixed parser bug, updated tests also"
assistant: "Previewing the text through the same correction pipeline the hook uses."
</example>
