---
name: config
description: Configure claude-english-buddy — set language, strictness, toggle auto-correction.
argument-hint: "[--show | --set key=value]"
allowed-tools: Bash, Read
disable-model-invocation: true
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Parse arguments

| Input | Action |
|-------|--------|
| (empty) or `--show` | Show current config |
| `--set auto_correct=true` | Set a config value |
| `--set summary_language=Chinese` | Set summary language |
| `--set strictness=strict` | Set strictness level |
| `--set domain_terms=Tailscale,Headscale` | Set domain terms |

### Step 2: Show current config

Read project config (`.claude-english-buddy.json` in cwd) and global config (`~/.claude/hooks/prompt_coach.json` if it exists). Display merged result:

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
- Project: `.claude-english-buddy.json` (in project root)
- Priority: project > global > defaults (`domain_terms` merge from both)
```

### Step 3: Set config value

If `--set` was used, split its argument at the first `=` into `{key}` and `{value}`. If there is no `=`, respond "Invalid setting: expected --set key=value" and STOP. Then update the project config file (`.claude-english-buddy.json` in cwd), passing both as arguments rather than splicing them into the code:

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

If the command exits non-zero, show its error line verbatim and STOP without showing the config.

Then show the updated merged config.

## Examples

<example>
Context: User wants to inspect the currently active merged configuration.
user: "/claude-english-buddy:config --show"
assistant: "Reading the project config and the global `~/.claude/hooks/prompt_coach.json`, and displaying the merged active settings with their source."
</example>
<example>
Context: User wants to raise the strictness level for their next session.
user: "/claude-english-buddy:config --set strictness=strict"
assistant: "Updating .claude-english-buddy.json with strictness=strict and showing the updated merged config."
</example>
