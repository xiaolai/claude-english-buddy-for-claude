---
name: claude-english-buddy-technical-writing
description: "Technical writing: API docs, README shape, error messages, terminology, voice."
---

# Technical Writing

Patterns specific to documentation and developer-facing prose. Rules drawn from the legacy $claude-english-buddy-writing-guide, the Google Developer Documentation Style Guide, and Strunk & White.

## Voice: Active vs Passive

Prefer active voice. It is shorter, clearer, and makes the actor explicit.

| Passive (weak) | Active (strong) |
|----------------|-----------------|
| "The cache was cleared by the scheduler." | "The scheduler clears the cache." |
| "Errors are handled by the retry middleware." | "The retry middleware handles errors." |
| "The API can be called with an optional token." | "Callers may pass an optional token." |

Passive voice is acceptable when:

- The actor is unknown or unimportant: "The feature was deprecated in 2023."
- The object is the real topic and moving it to the subject position helps flow: "Passwords are never stored in plaintext."

In API docs, always state who does what: callers, the service, the library, the user.

## API Documentation Patterns

A standard API reference entry has five parts:

1. **One-sentence summary** — what the function does, imperative present tense.
2. **Parameters table** — name, type, required?, description.
3. **Return value** — type and meaning.
4. **Errors** — what the function throws or returns on failure, and why.
5. **Example** — at least one runnable snippet per public function.

Keep each part terse. A reader arriving from a search result should see the summary without scrolling.

## README Structure

A README for a developer tool should answer, in order:

| Section | Question answered |
|---------|-------------------|
| Title + tagline | What is this? |
| Problem / motivation | Why does it exist? |
| Install | How do I install it? |
| Quick start | What does the shortest useful command look like? |
| Usage / commands | How do I actually use it? |
| Configuration | What knobs are there? |
| Development | How do I contribute? |
| License | What are the terms? |

Not every section is required. But the order matters: readers bounce if they have to scroll past philosophy before seeing `npm install`.

## Error Messages

An error message is prose, and its tone should be:

| Dimension | Requirement |
|-----------|-------------|
| Voice | Active: "Config missing: run `tool init` to create one." |
| Blame | Blame the situation, not the user. Not "You forgot to …". |
| Specificity | Name the missing thing, the expected thing, or the fix |
| Length | One line when possible; multi-line only if a fix is needed |
| Capitalization | Start with a capital; terminal period optional |
| Punctuation | Avoid exclamation marks |

| Bad | Good |
|-----|------|
| "Error!" | "Failed to parse config: expected `{`, got `[`." |
| "You're wrong." | "Port 6170 is already in use; pass `--port` to choose another." |
| "Something happened." | "Network request timed out after 30s." |

## Terminology Consistency

Pick one term per concept and use it everywhere in one document.

| Do not mix | Within one doc, pick |
|------------|----------------------|
| function, method, routine, handler | one term, e.g. "function" |
| config, configuration, settings | one term |
| log in, login, sign in, sign-in | one pair: verb ("log in") + noun ("login") |

Capitalize tool and framework names exactly as their owners do: `React`, `TypeScript`, `npm`, `GitHub`, `PostgreSQL`, `iOS`, `macOS`. This is a common L2 slip.

## Headings

Headings state the topic, not the conclusion. In reference docs they are usually noun phrases.

| Bad (full sentence) | Good (topic phrase) |
|---------------------|---------------------|
| "How you can install the tool" | "Installation" |
| "Here is what to do when it fails" | "Error handling" |
| "These are the configuration options" | "Configuration" |

No terminal punctuation in headings.

## Lists

- Parallel structure. Every bullet starts the same way (all imperative, or all noun phrases, or all full sentences).
- Use ordered lists when order matters (steps to follow) and unordered otherwise.
- Long bullet lists (more than seven items) usually hide a missing abstraction — consider a table.

## Tables

Tables beat prose for reference data. Prefer tables when:

- Two or more dimensions vary (e.g. level × behaviour).
- The reader will scan rather than read.
- Alignment makes comparison easy.

Table columns need parallel headings. First column usually holds the key (metric, flag, level). Align numbers to the right.

## Cross-References

Link the first mention of a concept, command, or component. Subsequent mentions in the same page usually do not need a link. Never write "click here" or "see below" as the link text — the linked phrase should read as the target name.

## Concise Phrasing in Docs

The wordy → concise table from `$claude-english-buddy-tone-calibration` applies in full here. The corrections most common in docs:

| Wordy | Concise |
|-------|---------|
| "in order to" | "to" |
| "at this point in time" | "now" |
| "has the ability to" | "can" |
| "is going to" | "will" |

## Scope

This skill covers technical writing patterns only. Related concerns live in sibling skills:

- `$claude-english-buddy-grammar-fundamentals` — general grammar independent of documentation
- `$claude-english-buddy-punctuation-rules` — punctuation conventions
- `$claude-english-buddy-tone-calibration` — per-context tone including commit, PR, email
- `$claude-english-buddy-common-non-native-mistakes` — recurring L2 patterns
- `$claude-english-buddy-writing-guide` — meta-skill routing to the four above
