---
name: claude-english-buddy-tone-calibration
description: "Per-context tone rubrics for developer communication: commit messages, PR descriptions, code comments, API docs, emails, inline chat. Use when judging whether the register and formality of a piece of text fit its destination, not just whether it is grammatical."
---

# Tone Calibration

Tone is fit-for-purpose: a sentence can be perfectly grammatical and still wrong for its context. Rubrics below are drawn from the legacy $claude-english-buddy-writing-guide plus the Google Developer Documentation Style Guide and Strunk & White on concise phrasing.

## The Imperative Voice

For commit messages, code comments, CLI help, and short docs, prefer the imperative — it is shorter and clearer than the indicative.

| Weak | Strong |
|------|--------|
| "You should run the tests" | "Run the tests" |
| "It would be good to add logging" | "Add logging" |
| "We need to refactor this" | "Refactor this" |

## Concise Phrasing

Cut filler. From Strunk & White, "Omit needless words."

| Wordy | Concise |
|-------|---------|
| "In order to" | "To" |
| "Due to the fact that" | "Because" |
| "At this point in time" | "Now" |
| "In the event that" | "If" |
| "Has the ability to" | "Can" |
| "Is going to" | "Will" |

## Context Rubrics

### Commit Message

| Dimension | Requirement |
|-----------|-------------|
| Mood | Imperative (Fix, Add, Refactor — not Fixed, Fixes, Fixing) |
| Tense | Present / imperative ("Fix parser crash"), never past |
| Subject length | ≤72 characters, 50 recommended |
| Terminal period on subject | None |
| Leading article | Drop ("Fix parser crash", not "Fix the parser crash") |
| Body | Optional; wrap at 72 chars; separated from subject by one blank line |
| Why vs what | Subject = what; body = why (if the what isn't self-evident) |

| Bad | Good |
|-----|------|
| "Fixed bug" | "Fix null pointer in session handler" |
| "Updated code" | "Refactor auth module to use token-based validation" |
| "Changes" | "Add rate limiting to API endpoints" |

Rule: imperative mood, present tense, specific. "Fix X" not "Fixed X" or "Fixes X".

### PR Description

| Dimension | Requirement |
|-----------|-------------|
| Mood | Indicative, present tense ("This change adds…") |
| Sentences | Full sentences |
| Sections | Summary / Changes / Test plan (or equivalent) |
| Links | Link issues, commits, and external discussion |
| Voice | Active preferred ("I removed the cache" > "The cache was removed") |

### Code Comments

| Dimension | Requirement |
|-----------|-------------|
| Mood | Imperative or indicative present |
| Length | One line per logical thought; ≤100 chars per line |
| Trailing punctuation | Period if the comment is a full sentence; none if it is a label |
| Purpose | Explain WHY, not WHAT (the code shows what) |

Avoid:

- Restating code: `// increment counter` next to `counter++`
- Commented-out code without a "remove-by" date

### API Documentation

| Dimension | Requirement |
|-----------|-------------|
| Mood | Indicative present ("Returns the user object") |
| Person | Avoid "we"; use imperative for instructions ("Pass a non-empty string") |
| Formality | Full sentences, no contractions |
| Terminology | Consistent — pick one term per concept and keep it |
| Capitalization | Match the canonical form of tool/framework names (`React`, not `react`; `npm`, not `NPM`) |

### Email

| Dimension | Requirement |
|-----------|-------------|
| Opening | Greeting line matched to recipient (first-name basis vs "Dear …") |
| Body | Full sentences; one topic per paragraph |
| Closing | Sign-off matched to formality ("Thanks," "Best," "Regards,") |
| Tone | Professional but warm; avoid both stiffness and slang |
| Requests | Direct — state the ask in the first paragraph |

### Inline Chat / Slack

| Dimension | Requirement |
|-----------|-------------|
| Formality | Informal — contractions, sentence fragments, and lower-case sentence starts are fine |
| Emoji | Fine if the team uses them |
| Code | Use backticks or code blocks for anything runnable |
| Question vs statement | End questions with `?`; do not end statements with `!` unless warranted |

## Tone Calibration Checklist

Before emitting a tone judgement, ask:

1. What is the destination (commit / PR / doc / email / chat)?
2. What mood and tense does that destination require?
3. What length constraints apply (e.g. commit subject ≤72)?
4. Does the phrasing contain wordy constructions that the concise table above would cut?
5. Does the formality match the audience?

If any of (1)–(5) is off, that is a tone issue — even if the text has no spelling or grammar errors.

## Scope

This skill covers tone and register only. Related concerns live in sibling skills:

- `$claude-english-buddy-grammar-fundamentals` — grammar mechanics independent of context
- `$claude-english-buddy-punctuation-rules` — punctuation conventions
- `$claude-english-buddy-technical-writing` — deeper API doc and README structure, voice in docs
- `$claude-english-buddy-common-non-native-mistakes` — recurring L2 slip patterns
- `$claude-english-buddy-writing-guide` — meta-skill routing to the four above
