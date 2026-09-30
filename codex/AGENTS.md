# claude-english-buddy (Codex)

English language coach for non-native speakers. The Codex layout ships the same coaching hook as the Claude Code plugin plus 17 skills under `codex/skills/`, all prefixed `claude-english-buddy-`.

The manifest sets `"commands": []`. Without it, Codex converts the Claude `commands/*.md` (including the `commands/shared/` partials) into extra skills that duplicate `codex/skills/`.

This tree is hand-built. Do not regenerate it with `build-codex.mjs --force`: the converter would bring back `$ARGUMENTS` placeholders, `${CLAUDE_PLUGIN_ROOT}` paths, and Claude tool names. `tests/codex-layout.test.mjs` fails if any of those reappear.

## Hooks

Codex loads the plugin-root `hooks/hooks.json`, the same file Claude Code uses, and exports `PLUGIN_ROOT`, `PLUGIN_DATA`, `CLAUDE_PLUGIN_ROOT`, and `CLAUDE_PLUGIN_DATA` to hook commands. So there is no Codex copy of the hooks. A copy under `codex/hooks/` would not be loaded.

| Event | Script | Under Codex |
|-------|--------|-------------|
| `UserPromptSubmit` | `scripts/prompt-coach-hook.mjs` | Same behavior as under Claude Code: correct, translate, or refine (`::`), with the result injected as `hookSpecificOutput.additionalContext` |
| `SessionEnd` | `scripts/session-end-hook.mjs` | Runs, but Codex treats `SessionEnd` as advisory, so its stderr summary is not shown |

Codex runs plugin hooks only after the user trusts them (`/hooks`). The hook calls Claude Haiku with the user's own Anthropic credentials (`ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN`, or the macOS keychain entry a signed-in Claude Code writes). Without credentials the hook makes no API call and records nothing, but it still injects the `summary_language` instruction.

## Skills

| Skill | Purpose |
|-------|---------|
| `$claude-english-buddy-today` | Today's report: corrections, recurring patterns, lessons, trend |
| `$claude-english-buddy-stats` | Trends over N days (default 30) |
| `$claude-english-buddy-mistakes` | All-time top recurring mistakes |
| `$claude-english-buddy-drill` | Spot-quiz on the user's top-3 mistake categories |
| `$claude-english-buddy-config` | Show or set `auto_correct`, `summary_language`, `strictness`, `domain_terms` |
| `$claude-english-buddy-review` | Deep review of any text or file |
| `$claude-english-buddy-preview` | Dry-run review; logs nothing |
| `$claude-english-buddy-writing-reviewer` | Orchestrates the three specialists below into one report |
| `$claude-english-buddy-grammar-checker` | Mechanical grammar and punctuation pass |
| `$claude-english-buddy-tone-calibrator` | Tone fit per context, scored 1 to 5 |
| `$claude-english-buddy-clarity-enhancer` | Run-ons, ambiguous references, nesting, terminology drift |
| `$claude-english-buddy-writing-guide` | Router to the five reference skills below |
| `$claude-english-buddy-grammar-fundamentals` | Reference: grammar rules |
| `$claude-english-buddy-punctuation-rules` | Reference: punctuation rules |
| `$claude-english-buddy-tone-calibration` | Reference: per-context tone rubrics |
| `$claude-english-buddy-technical-writing` | Reference: docs, READMEs, error messages |
| `$claude-english-buddy-common-non-native-mistakes` | Reference: recurring L2 error patterns |

## Paths

Codex does not export a plugin-root variable to skill commands, and an inherited `CLAUDE_PLUGIN_DATA` may belong to another plugin. So:

- **Plugin root.** Each skill resolves it as the directory three levels above its own `SKILL.md` (`<root>/codex/skills/<skill>/SKILL.md`). Codex reads skills by absolute path, so that path is known.
- **Correction history.** The report skills call `scripts/history-report.mjs --host codex`, which reads `$CODEX_HOME/plugins/data/claude-english-buddy-<marketplace>/history/` (the directory Codex gives the hook as `PLUGIN_DATA`) and ignores `CLAUDE_PLUGIN_DATA`. Exit code 3 means the hook has not recorded anything yet.

History is per host: prompts typed in Codex are logged under `~/.codex/plugins/data/`, and prompts typed in Claude Code under `~/.claude/plugins/data/`. Config is shared: both hosts read `.claude-english-buddy.json` and `~/.claude/hooks/prompt_coach.json`.

## Differences from the Claude Code plugin

| Claude Code | Codex |
|-------------|-------|
| `/claude-english-buddy:<command>` slash commands | `$claude-english-buddy-<name>` skills; options come from the user's request, not `$ARGUMENTS` |
| `writing-reviewer` dispatches three subagents via `Task` | `$claude-english-buddy-writing-reviewer` runs the three specialist skills, in parallel subagents if the runtime allows, otherwise one after another |
| Agents pinned to haiku / sonnet | No model pins; the session model runs every skill |
| `.claude/rules/` (voice preservation, minimal invasiveness, no over-polishing) | Folded into a "Review discipline" section in `$claude-english-buddy-review` and `$claude-english-buddy-writing-reviewer` |

## Checks

```bash
npm test    # includes tests/codex-layout.test.mjs and the hook wire-format test
```
