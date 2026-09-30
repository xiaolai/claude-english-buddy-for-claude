---
name: punctuation-rules
description: "Punctuation conventions for developer prose: commas (serial, Oxford, clause-joining), semicolons, colons, hyphens vs en-dashes vs em-dashes, apostrophes, quotation marks. Use when reviewing punctuation of documentation, commit messages, or any prose where mis-pointing changes meaning."
version: 0.1.0
user-invocable: false
---

# Punctuation Rules

Conventions follow the Chicago Manual of Style and the Google Developer Documentation Style Guide for points where they agree. Where they disagree, the Google guide (more common in tech) wins.

## Commas

### Serial (Oxford) Comma

Use the Oxford comma — the comma before the final `and` / `or` in a list of three or more items. This is the rule in the Google Developer Documentation Style Guide.

| Wrong | Right |
|-------|-------|
| "We ship on Linux, macOS and Windows." | "We ship on Linux, macOS, and Windows." |
| "Tests cover auth, storage and routing." | "Tests cover auth, storage, and routing." |

### Joining Independent Clauses

Use a comma before a coordinating conjunction (`and`, `but`, `or`, `nor`, `for`, `so`, `yet`) when it joins two independent clauses.

| Wrong | Right |
|-------|-------|
| "The build passed but the tests failed." | "The build passed, but the tests failed." |
| "Run `npm install`, and then `npm test`." | "Run `npm install`, then `npm test`." (single subject, no coordinator → no comma needed) |

### Introductory Element

A comma follows an introductory word, phrase, or dependent clause.

- "After installing, run the migration."
- "If the config is missing, the hook exits 0."
- "However, the API rate-limits after 100 requests per minute."

### Do Not Use a Comma

- Between subject and verb: "The module, handles auth." is wrong.
- To splice two independent clauses without a conjunction (comma splice): "The build passed, the tests failed." → use a semicolon, period, or coordinator.

## Semicolons

Two uses:

1. Join two independent clauses that are closely related and have no coordinating conjunction.
   - "The build passed; the tests failed."
2. Separate list items that themselves contain commas.
   - "We deploy to three regions: us-east-1, the primary; eu-west-1, the European mirror; and ap-south-1, the Asian mirror."

Do **not** use a semicolon where a colon or period would do.

## Colons

Use a colon to introduce:

- A list: "We support three shells: bash, zsh, and fish."
- An explanation or amplification: "The test is flaky: it depends on system time."
- A quotation or block example.

The clause before a colon must be a complete sentence. "Such as: A, B, C" is wrong; "The inputs are: A, B, C" is fine.

## Hyphens, En Dashes, Em Dashes

| Mark | Character | Use |
|------|-----------|-----|
| Hyphen | `-` | Compound modifiers before a noun ("command-line tool"), compound nouns that the dictionary spells with a hyphen ("check-in", "mother-in-law"), line breaks |
| En dash | `–` | Ranges ("pages 10–20", "Monday–Friday"), scores ("Home–Away 3–1") |
| Em dash | `—` | Parenthetical or break in thought — use sparingly in technical prose |

Key points:

- `state-of-the-art` before a noun is hyphenated. "The technique is state of the art" (predicate) is not.
- Do not hyphenate adverbs ending in `-ly`: "a fully documented module", not "a fully-documented module".
- Most code writing uses ASCII hyphens for all three when pasting into plain text is a concern; prefer real en/em dashes in published prose.

## Apostrophes

Two uses:

1. Possession: `the user's config`, `the module's exports`.
2. Contractions: `don't`, `it's`, `we're`.

Plurals never take an apostrophe:

| Wrong | Right |
|-------|-------|
| "API's" | "APIs" |
| "1990's" | "1990s" |
| "CPU's" | "CPUs" |

Possession of plurals ending in `s`: apostrophe after the `s` — `the developers' feedback`, `the tests' output`.

## Quotation Marks

- Use double quotes for direct quotes and short in-line strings in prose.
- Use single quotes only inside a double-quoted passage.
- In American English, periods and commas go inside the closing quote; colons and semicolons go outside.
  - Right (US): `He called the flag "experimental."`
  - Right (US): `We use "strict mode"; it catches more bugs.`

For code snippets inside prose, prefer backticks (`` `npm test` ``) over quotes.

## Periods in Lists and Headings

- Bullet lists: end each bullet with a period only if the bullet is a complete sentence. Otherwise no terminal punctuation.
- Headings: no terminal period, ever.
- Commit subject lines: no trailing period.

## Scope

This skill covers punctuation mechanics only. Related concerns live in sibling skills:

- **grammar-fundamentals** — article usage, agreement, tense, prepositions
- **tone-calibration** — formality and tone across contexts
- **technical-writing** — API doc patterns, voice, terminology
- **common-non-native-mistakes** — recurring punctuation errors
- **writing-guide** — meta-skill routing to the four above
