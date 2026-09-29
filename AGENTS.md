# claude-english-buddy

English language coach for non-native speakers using Claude Code. Auto-corrects prompts via UserPromptSubmit hook, tracks corrections, generates daily reports.

## Prerequisites

- Node.js >= 18
- Run `npm install` after cloning the plugin to install dependencies before running tests or hooks.

## Project structure

```
commands/
  today.md              /today — daily correction report with lessons
  stats.md              /stats — long-term trends and improvement
  mistakes.md           /mistakes — all-time recurring errors
  config.md             /config — configure settings
  review.md             /review — deep text review
  preview.md            /preview — dry-run correction preview
  drill.md              /drill — spot-quiz on top recurring mistakes
  shared/
    config-loader.md    Shared partial — resolve merged config
    jsonl-parser.md     Shared partial — read JSONL history
    format-report.md    Shared partial — report output conventions
agents/
  writing-reviewer.md   Deep English text reviewer — orchestrator
  grammar-checker.md    Grammar and mechanics subagent
  tone-calibrator.md    Tone and register subagent
  clarity-enhancer.md   Clarity and phrasing subagent
skills/
  claude-english-buddy/
    writing-guide/              SKILL.md — meta-router to focused skills
    grammar-fundamentals/       Grammar rules reference
    punctuation-rules/          Punctuation rules reference
    tone-calibration/           Tone and register guidance
    technical-writing/          Conventions for dev-facing prose
    common-non-native-mistakes/ Common L2-English error patterns
.claude/
  rules/
    01-voice-preservation.md    Preserve author voice during corrections
    02-minimal-invasiveness.md  Only change text tied to an identified error
    03-no-over-polishing.md     Cap lessons per review; no cosmetic rewrites
hooks/
  hooks.json            UserPromptSubmit + SessionEnd hooks
scripts/
  prompt-coach-hook.mjs   Main hook — correct/translate/refine
  session-end-hook.mjs    Session summary on exit
  lib/
    detect.mjs          Language detection (ASCII ratio heuristic)
    state.mjs           Correction history (JSONL per day)
    stats.mjs           Trend analysis and pattern extraction
tests/
  detect.test.mjs       Language detection tests
  state.test.mjs        State persistence tests
  stats.test.mjs        Stats computation tests
package.json            Node.js project config
```

## Conventions

### Hook behavior

The UserPromptSubmit hook has four modes:
- **correct**: English with errors → fix and show corrections via `systemMessage`
- **translate**: Non-English detected (ASCII ratio < 85%) → translate via `systemMessage`
- **refine**: `::` prefix → rewrite into precise prompt via `systemMessage`
- **skip**: slash commands, short prompts, code patterns → exit 0

All modes inject corrected/translated text into `additionalContext` so Claude acts on the clean version. If `summary_language` is configured, the summary instruction is appended to `additionalContext` in all modes.

### State storage

Correction history stored as JSONL in `$CLAUDE_PLUGIN_DATA/claude-english-buddy/history/YYYY-MM-DD.jsonl`. One line per correction event:

```json
{"ts":"...","mode":"correct","original":"...","corrected":"...","annotations":"(...)","session":"..."}
```

Clean prompts logged as `{"mode":"clean"}` for accurate rate calculation.

### Config resolution

Priority: project (`.claude-english-buddy.json`) > global (`~/.claude/hooks/prompt_coach.json`) > defaults.

### Testing

```bash
npm test    # Node.js native test runner
```
