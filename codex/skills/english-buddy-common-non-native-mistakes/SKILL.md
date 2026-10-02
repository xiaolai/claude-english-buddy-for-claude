---
name: english-buddy-common-non-native-mistakes
description: "Recurring non-native English slips: articles, prepositions, tense, 'I am agree'."
---

# Common Non-Native Mistakes

These patterns come from the legacy $english-buddy-writing-guide plus widely-documented L2-English error categories (no invented rules). They concentrate on slips that slip past spellcheck and automated grammar checkers because every individual word is a real English word.

## Article Slips

| Wrong | Right | Why |
|-------|-------|-----|
| "Fix bug in authentication" | "Fix **the** bug in authentication" | Specific bug → definite article |
| "Create a new the file" | "Create a new file" | Two determiners on the same noun |
| "I use the React" | "I use React" | Framework names take no article |
| "An useful tool" | "A useful tool" | `u` here is pronounced `y`, so `a` not `an` |
| "I have question" | "I have **a** question" | Countable singular noun needs a determiner |

Test for `a` vs `an`: does the following word START with a vowel SOUND? If yes, `an`. Otherwise `a`. (`a URL`, not `an URL`, because URL starts with the consonant sound "y".)

## Preposition Confusion

Non-native speakers often transfer prepositions from their first language.

| Wrong | Right |
|-------|-------|
| "depend of" | "depend **on**" |
| "consist in" | "consist **of**" |
| "different of" | "different **from**" |
| "search a solution" | "search **for** a solution" |
| "discuss about it" | "discuss it" (no preposition after `discuss`) |
| "married with" | "married **to**" |
| "capable to" | "capable **of**" |
| "afraid from" | "afraid **of**" |

Prepositions are memorised per verb. There is no general rule.

## "I Am Agree" and Copula Stacking

A large family of errors doubles a state verb where only one is needed.

| Wrong | Right |
|-------|-------|
| "I am agree with you." | "I agree with you." |
| "I am disagree." | "I disagree." |
| "He is depend on that." | "He depends on that." |
| "She is work at Google." | "She works at Google." |

Rule: `agree`, `disagree`, `depend`, `work`, `like`, `want`, `need` are verbs, not adjectives. They do not take `be`.

## Subject-Verb Agreement

| Wrong | Right | Why |
|-------|-------|-----|
| "There is many issues." | "There are many issues." | Plural subject |
| "The data show that …" | "The data shows that …" | `data` is singular in modern tech usage |
| "None of the tests pass." | "None of the tests passes." | `None` is singular in formal writing |
| "Everyone have their tokens." | "Everyone has their tokens." | `everyone` is singular |

## Its vs It's

| Form | Meaning | Example |
|------|---------|---------|
| `it's` | contraction of `it is` / `it has` | "It's broken" |
| `its` | possessive | "The module and its tests" |

Test: try expanding to "it is". If the sentence still works, use `it's`.

## Tense Mismatch

Switching tense mid-paragraph is a frequent L2 slip.

| Wrong | Right |
|-------|-------|
| "The hook reads stdin and wrote the log." | "The hook reads stdin and writes the log." |
| "Yesterday I fix the bug and push it." | "Yesterday I fixed the bug and pushed it." |

Pick one tense per paragraph and hold it.

## Redundant Double Negatives or Double Comparatives

| Wrong | Right |
|-------|-------|
| "more faster" | "faster" |
| "the most simplest" | "the simplest" |
| "I don't know nothing." | "I don't know anything." |
| "There isn't no bug." | "There isn't a bug." / "There is no bug." |

## Plural / Uncountable Confusion

Uncountable nouns that look like they should be pluralizable:

| Wrong | Right |
|-------|-------|
| "informations" | "information" (or "pieces of information") |
| "advices" | "advice" (or "pieces of advice") |
| "softwares" | "software" |
| "equipments" | "equipment" |
| "feedbacks" | "feedback" (or "pieces of feedback") |
| "researches" | "research" (as noun; "researches" is the verb third-person) |

## Word-Order Inversion

English expects strict Subject–Verb–Object. Moving pieces around (as is natural in languages with flexible or verb-second word order, such as German, Dutch, or Spanish) reads as broken.

| Wrong | Right |
|-------|-------|
| "Always I run the tests." | "I always run the tests." |
| "Yesterday came the release." | "The release came yesterday." |
| "Is working the server?" | "Is the server working?" |

Placement of frequency adverbs (`always`, `often`, `rarely`): between subject and verb, or after `be`.

## False Cognates ("Faux Amis")

Watch for words that exist in both languages with different meanings.

| Word | Native speaker may mean | English actually means |
|------|-------------------------|------------------------|
| "actual" | current / real | real (NOT current; that is `current`) |
| "eventual" | possible, perhaps | final, certain-but-later |
| "library" | book-lending place | collection of reusable code (in tech) |
| "sensible" | sensitive | practical, reasonable |
| "sympathetic" | nice / friendly | feeling pity toward |
| "assist" | attend (a meeting) | help |

## Commit-Message-Specific Slips

| Wrong | Right | Why |
|-------|-------|-----|
| "Fixed bug" | "Fix bug" | Imperative, not past tense |
| "Updated code" | "Refactor auth module" | Imperative + specific |
| "Changes" | "Add rate limiting to API endpoints" | State what changed |
| "Fix the bug." | "Fix parser crash on empty input" | No leading article, no trailing period |

## Scope

This skill catalogues recurring L2 slip patterns so a reviewer can label a mistake by pattern rather than reinvent the rule. Related concerns live in sibling skills:

- `$english-buddy-grammar-fundamentals` — the underlying grammar rules these patterns violate
- `$english-buddy-punctuation-rules` — punctuation slips
- `$english-buddy-tone-calibration` — tone and formality per context
- `$english-buddy-technical-writing` — API doc and README conventions
- `$english-buddy-writing-guide` — meta-skill routing to the four above
