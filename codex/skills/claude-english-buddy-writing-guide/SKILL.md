---
name: claude-english-buddy-writing-guide
description: "Router to this plugin's five writing skills: decide which one to consult."
---

# Writing Guide (Meta-Skill)

This skill used to contain all English writing patterns in a single file. It has been split into five focused skills. This file is now a router: read it to pick the right sibling skill for the task at hand.

If you loaded `$claude-english-buddy-writing-guide` directly, you almost always want one of the five skills below instead. Load the specific one(s) your task needs — or load all five for a deep review.

## Routing Table

| Trigger | Load this skill |
|---------|-----------------|
| Article (a/an/the) question, agreement, tense, preposition, comparative/superlative, countable-vs-mass noun | `$claude-english-buddy-grammar-fundamentals` |
| Comma, semicolon, colon, hyphen/en-dash/em-dash, apostrophe, quotation mark | `$claude-english-buddy-punctuation-rules` |
| "Does this fit a commit message / PR description / API doc / email / chat?" | `$claude-english-buddy-tone-calibration` |
| API reference wording, README shape, error-message phrasing, active vs passive in docs, terminology consistency | `$claude-english-buddy-technical-writing` |
| "I think this is a typical L2 pattern" — recurring non-native slips (article misuse, 'I am agree', preposition transfer, false cognates, word-order inversion) | `$claude-english-buddy-common-non-native-mistakes` |

## When to Load Multiple

| Task | Combination |
|------|-------------|
| Full deep review of any text | all five |
| Commit-message polish | $claude-english-buddy-tone-calibration + $claude-english-buddy-grammar-fundamentals + $claude-english-buddy-common-non-native-mistakes |
| README audit | $claude-english-buddy-technical-writing + $claude-english-buddy-grammar-fundamentals + $claude-english-buddy-punctuation-rules |
| Quick grammar check on a sentence | $claude-english-buddy-grammar-fundamentals + $claude-english-buddy-common-non-native-mistakes |
| Punctuation-only pass (e.g. pre-publication polish) | $claude-english-buddy-punctuation-rules |

## Skill Fingerprints

### $claude-english-buddy-grammar-fundamentals

Covers: articles (a/an/the), subject-verb agreement, its vs it's, who/that/which, prepositions, tense consistency, countable vs mass nouns, comparatives/superlatives.

### $claude-english-buddy-punctuation-rules

Covers: serial (Oxford) comma, comma joining independent clauses, introductory comma, comma splice, semicolons, colons, hyphens vs en-dashes vs em-dashes, apostrophes (possession, contractions, plurals), quotation marks (US punctuation placement), periods in lists and headings.

### $claude-english-buddy-tone-calibration

Covers: imperative voice for instructions, concise phrasing (wordy → concise), per-context rubrics (commit message, PR description, code comments, API documentation, email, inline chat), tone calibration checklist.

### $claude-english-buddy-technical-writing

Covers: active vs passive voice, API documentation five-part structure, README section order, error-message wording, terminology consistency, headings, lists, tables, cross-references, concise phrasing applied to docs.

### $claude-english-buddy-common-non-native-mistakes

Covers: article slips, preposition confusion, 'I am agree' copula stacking, subject-verb agreement, its/it's, tense mismatch, double comparatives, plural/uncountable confusion, word-order inversion, false cognates, commit-message-specific slips.

## Scope

This meta-skill contains no grammar, punctuation, tone, documentation, or L2-pattern rules on its own. Every rule lives in one of the five sibling skills. If you are tempted to add content here, add it to the matching sibling skill instead.
