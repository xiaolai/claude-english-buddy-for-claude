---
name: claude-english-buddy-grammar-fundamentals
description: "English grammar for developer prose: articles, agreement, tense, prepositions."
---

# Grammar Fundamentals

Core grammar rules covering the categories where non-native developers most often slip. Every rule below is drawn from the legacy $claude-english-buddy-writing-guide; no new rules are invented here.

## Articles (a / an / the / zero)

| Wrong | Right | Rule |
|-------|-------|------|
| "Fix bug in authentication" | "Fix **the** bug in authentication" | Specific, identifiable noun = use `the` |
| "Create a new the file" | "Create a new file" | Already have `a` = drop `the` |
| "I use the React" | "I use React" | Framework / tool names take no article |

Quick check:

- If the reader can point to a specific item already in context, use `the`.
- If the noun is one of many or first-mentioned, use `a` / `an`.
- Proper nouns (React, TypeScript, Linux) take no article.

## Subject-Verb Agreement

| Wrong | Right | Rule |
|-------|-------|------|
| "There is many issues" | "There **are** many issues" | Plural subject → plural verb |
| "The data show" | "The data **shows**" | `data` is singular in modern tech usage |
| "None of the tests pass" | "None of the tests **passes**" | `None` = singular in formal writing |

Notes:

- Collective nouns (team, staff, data) are treated as singular in American technical writing.
- `everyone / someone / nobody` take singular verbs.

## Its vs It's

| Form | Meaning | Example |
|------|---------|---------|
| `it's` | `it is` / `it has` | "It's broken" = "It is broken" |
| `its` | possessive (belonging to it) | "The module and its tests" |

Test: replace with "it is". If the sentence still works, the apostrophe belongs.

## Who vs That vs Which

| Use | For | Example |
|-----|-----|---------|
| `who` | People | "The developer **who** wrote this" |
| `that` | Things, restrictive clause | "The function **that** handles auth" |
| `which` | Things, non-restrictive clause | "The module, **which** was added last week, has a bug" |

Restrictive clause = essential to identify the noun, no commas, use `that`.
Non-restrictive clause = extra info, set off with commas, use `which`.

## Prepositions

| Wrong | Right |
|-------|-------|
| "depend of" | "depend **on**" |
| "consist in" | "consist **of**" |
| "different of" | "different **from**" |
| "search a solution" | "search **for** a solution" |

Prepositions are memorised per verb; there is no general rule.

## Tense Consistency

Stay in one tense inside a single paragraph unless you are explicitly comparing before-and-after states.

| Bad | Good |
|-----|------|
| "The hook reads stdin and wrote the log." | "The hook reads stdin and writes the log." |
| "We will add caching and we stored it in Redis." | "We will add caching and store it in Redis." |

Common idiomatic tenses by context:

| Context | Dominant tense |
|---------|----------------|
| Commit message subject | Imperative ("Fix X") |
| PR description body | Present ("This change adds…") |
| API documentation | Present ("Returns a user object") |
| Changelog entry | Past or imperative ("Added Y") |
| Design document | Present or future ("The service will…") |

## Countable vs Mass Nouns

| Mass (no plural, no `a`) | Countable (pluralize, use `a`) |
|--------------------------|--------------------------------|
| information, advice, feedback, progress | a file, two files, an error, errors |
| software, hardware, equipment | a module, modules |
| research, work | a task, tasks |

Common slip: "an information" → "a piece of information" or "some information".

## Comparatives and Superlatives

| Wrong | Right |
|-------|-------|
| "more faster" | "faster" |
| "the most simplest" | "the simplest" |
| "more better" | "better" |

Rules:

- One-syllable adjectives: add `-er` / `-est` (fast → faster → fastest).
- Two or more syllables: use `more` / `most` (useful → more useful → most useful).
- Never stack both (`more faster`, `most simplest` are always wrong).

## Scope

This skill covers grammar mechanics only. Related concerns live in sibling skills:

- `$claude-english-buddy-punctuation-rules` — commas, semicolons, hyphens, apostrophes, quotation marks
- `$claude-english-buddy-tone-calibration` — imperative vs indicative, formality per context
- `$claude-english-buddy-technical-writing` — passive/active voice in docs, terminology consistency
- `$claude-english-buddy-common-non-native-mistakes` — recurring error patterns and anti-patterns
- `$claude-english-buddy-writing-guide` — meta-skill that routes consumers to the four above
