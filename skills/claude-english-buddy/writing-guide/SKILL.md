---
name: writing-guide
description: "Router to this plugin's five writing skills: decide which one to consult."
version: 0.2.0
user-invocable: false
---

# Writing Guide (Meta-Skill)

This skill used to contain all English writing patterns in a single file. It has been split into five focused skills. This file is now a router: read it to pick the right sibling skill for the task at hand.

If you loaded `writing-guide` directly, you almost always want one of the five skills below instead. Load the specific one(s) your task needs — or load all five for a deep review.

## Routing Table

| Trigger | Load this skill |
|---------|-----------------|
| Article (a/an/the) question, agreement, tense, preposition, comparative/superlative, countable-vs-mass noun | **grammar-fundamentals** |
| Comma, semicolon, colon, hyphen/en-dash/em-dash, apostrophe, quotation mark | **punctuation-rules** |
| "Does this fit a commit message / PR description / API doc / email / chat?" | **tone-calibration** |
| API reference wording, README shape, error-message phrasing, active vs passive in docs, terminology consistency | **technical-writing** |
| "I think this is a typical L2 pattern" — recurring non-native slips (article misuse, 'I am agree', preposition transfer, false cognates, word-order inversion) | **common-non-native-mistakes** |

## When to Load Multiple

| Task | Combination |
|------|-------------|
| Full deep review of any text | all five |
| Commit-message polish | tone-calibration + grammar-fundamentals + common-non-native-mistakes |
| README audit | technical-writing + grammar-fundamentals + punctuation-rules |
| Quick grammar check on a sentence | grammar-fundamentals + common-non-native-mistakes |
| Punctuation-only pass (e.g. pre-publication polish) | punctuation-rules |

## Skill Fingerprints

### grammar-fundamentals

Covers: articles (a/an/the), subject-verb agreement, its vs it's, who/that/which, prepositions, tense consistency, countable vs mass nouns, comparatives/superlatives.

### punctuation-rules

Covers: serial (Oxford) comma, comma joining independent clauses, introductory comma, comma splice, semicolons, colons, hyphens vs en-dashes vs em-dashes, apostrophes (possession, contractions, plurals), quotation marks (US punctuation placement), periods in lists and headings.

### tone-calibration

Covers: imperative voice for instructions, concise phrasing (wordy → concise), per-context rubrics (commit message, PR description, code comments, API documentation, email, inline chat), tone calibration checklist.

### technical-writing

Covers: active vs passive voice, API documentation five-part structure, README section order, error-message wording, terminology consistency, headings, lists, tables, cross-references, concise phrasing applied to docs.

### common-non-native-mistakes

Covers: article slips, preposition confusion, 'I am agree' copula stacking, subject-verb agreement, its/it's, tense mismatch, double comparatives, plural/uncountable confusion, word-order inversion, false cognates, commit-message-specific slips.

## Scope

This meta-skill contains no grammar, punctuation, tone, documentation, or L2-pattern rules on its own. Every rule lives in one of the five sibling skills. If you are tempted to add content here, add it to the matching sibling skill instead.
