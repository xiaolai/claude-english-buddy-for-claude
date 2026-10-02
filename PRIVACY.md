# Privacy Policy — english-buddy

_Last updated: 2026-05-20_

english-buddy is a Claude Code and Codex CLI plugin that auto-corrects English mistakes in your prompts via a `UserPromptSubmit` hook. **This plugin transmits prompt text to a Large Language Model API. Read carefully.**

## What is sent externally

For every prompt you submit while the hook is active, the hook sends the prompt text to a Large Language Model so it can suggest corrections:

- **Default path**: `https://api.anthropic.com/v1/messages` (Anthropic API)
- **Bedrock path** (when `CLAUDE_CODE_USE_BEDROCK=1`): AWS Bedrock `bedrock-runtime:InvokeModel`

The transmission uses **your own credentials** — `CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_API_KEY`, or the OAuth token in your macOS keychain. The plugin does **not** have, and does **not** use, a centralized API key.

Anthropic's privacy policy applies to data sent through the Anthropic API. AWS's privacy policy applies to data sent through Bedrock.

## What is stored locally

- `$CLAUDE_PLUGIN_DATA/history/YYYY-MM-DD.jsonl` (under Codex: `~/.codex/plugins/data/english-buddy-<marketplace>/history/`) — a JSON-lines file containing each prompt, its correction, and metadata (timestamp, session id, correction category). Stored on your local filesystem only; **never transmitted**.
- Configuration in `~/.claude/hooks/prompt_coach.json` (global) or `.english-buddy.json` (project).

The local history powers `/english-buddy:today`, `/english-buddy:stats`, `/english-buddy:mistakes`, and `/english-buddy:drill` — all of which read from your local filesystem only.

## What is not collected

The plugin maintainer (xiaolai) does **not** see, log, store, or aggregate any user prompt or correction. There is **no central server**. No telemetry, no analytics, no usage pings.

## How to disable

- **Disable auto-correction** while keeping the plugin installed: set `auto_correct: false` in `.english-buddy.json`, or run `/english-buddy:config --set auto_correct=false`. The hook continues to run but skips API calls, except for prompts you explicitly start with `::` to request refinement.
- **Use the dry-run mode**: `/english-buddy:preview <text>` reviews text without submitting a prompt or persisting anything.
- **Remove local correction history**: delete `$CLAUDE_PLUGIN_DATA/history/`.
- **Uninstall completely**: `claude plugin uninstall english-buddy@xiaolai`, or under Codex `codex plugin remove english-buddy@xiaolai`.

## Third parties

- **Anthropic** (`api.anthropic.com`) — receives the text of prompts you submit, for the purpose of generating corrections. Anthropic's privacy policy: <https://www.anthropic.com/legal/privacy>
- **AWS Bedrock** (optional, only when `CLAUDE_CODE_USE_BEDROCK=1`) — alternative routing for the same prompt text. AWS's privacy policy: <https://aws.amazon.com/privacy/>

## Data deletion

There is no centralized data to delete on the maintainer's side. To remove your local data: delete `$CLAUDE_PLUGIN_DATA/` (this plugin's own data directory) and uninstall the plugin.

## Contact

For privacy questions or to report a discrepancy with this policy: **xiaolaiapple@gmail.com**.
