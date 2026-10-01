---
name: claude-english-buddy-config
description: "Use when the user wants to see or change claude-english-buddy settings: auto-correction on/off, summary language, strictness (gentle / standard / strict), or domain terms the coaching hook must never correct. Shows the merged project + global config with the source of each value, or writes one key to the project config."
---

# English Coach Config

## Step 1: Parse the request

| Request | Action |
|---------|--------|
| Show / nothing specific / `--show` | Show the current config (Step 2) |
| `--set auto_correct=false` or "turn off auto-correct" | Set `auto_correct` |
| `--set summary_language=Chinese` | Set `summary_language` (`disabled` clears it) |
| `--set strictness=strict` | Set `strictness` |
| `--set domain_terms=Tailscale,Headscale` | Set `domain_terms` |

## Step 2: Show the current config

Read the project config (`.claude-english-buddy.json` in the current directory) and the global config (`~/.claude/hooks/prompt_coach.json`, if it exists). The coaching hook reads the same two files under Codex and Claude Code, so one global file configures both. Display the merged result:

```markdown
# English Coach Config

## Active Settings (merged)

| Setting | Value | Source |
|---------|-------|--------|
| auto_correct | {value} | {global / project / default} |
| summary_language | {value or "disabled"} | {source} |
| strictness | {value} | {source} |
| domain_terms | {list or "none"} | {source} |

## Strictness Levels

| Level | Behavior |
|-------|----------|
| gentle | Only fix clear errors. Accept informal English. |
| standard | Fix errors + improve awkward phrasing. (default) |
| strict | Fix everything + suggest more natural alternatives. |

## Config Files

- Global: `~/.claude/hooks/prompt_coach.json`
- Project: `.claude-english-buddy.json` (in the project root)
- Priority: project > global > defaults (`domain_terms` merge from both)
```

Defaults: `auto_correct` true, `summary_language` null, `strictness` "standard", `domain_terms` [].

## Step 3: Set a value

Split the setting at the first `=` into `{key}` and `{value}`. With no `=`, respond "Invalid setting: expected key=value" and STOP. Write only the project file, never the global one, passing both as arguments rather than splicing them into the code:

```bash
node -e '
  const fs = require("fs");
  const [key, raw] = process.argv.slice(1);
  const file = ".claude-english-buddy.json";
  const parse = {
    auto_correct: (v) => (v === "true" ? true : v === "false" ? false : undefined),
    summary_language: (v) => (v === "" || v === "disabled" ? null : v),
    strictness: (v) => (["gentle", "standard", "strict"].includes(v) ? v : undefined),
    domain_terms: (v) => v.split(",").map((t) => t.trim()).filter(Boolean),
  };
  if (!parse[key]) { console.error(`Invalid setting: ${key}=${raw} (known keys: ${Object.keys(parse).join(", ")})`); process.exit(1); }
  const value = parse[key](raw);
  if (value === undefined) { console.error(`Invalid setting: ${key}=${raw}`); process.exit(1); }
  let config = {};
  if (fs.existsSync(file)) {
    try { config = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch { console.error(`Malformed config: ${file}`); process.exit(1); }
  }
  config[key] = value;
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  console.log(`Set ${key} = ${JSON.stringify(value)}`);
' "{key}" "{value}"
```

If the command exits non-zero, show its error line verbatim and STOP without showing the config. Otherwise show the updated merged config (Step 2).

Supported coaching controls: `coaching_mode=on-demand|automatic`, `sample_rate` (0–1), and `timeout_seconds` (1–30, default 5). On-demand mode runs only explicit `::` requests. Preserve these settings when saving config.
