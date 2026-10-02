---
description: "Shared: unified config load across english-buddy commands"
user-invocable: false
disable-model-invocation: true
---

> **Plugin root:** this file is read as plain text, so `${CLAUDE_PLUGIN_ROOT}` below is not expanded, and it is unset in your shell. Before running any command here, replace it with this plugin's root: the directory two levels above this file (`<root>/commands/shared/`).

<!-- Shared partial: config loader -->
<!-- Referenced by: config, today, stats, mistakes, preview, drill. Do not use standalone. -->

## Config Resolution

All english-buddy commands share the same three-layer config resolution.

### Priority (highest to lowest)

1. **Project config** — `.english-buddy.json` in the current working directory (`.claude-english-buddy.json`, the name before 0.8.0, is read when the new file is absent)
2. **Global config** — `~/.claude/hooks/prompt_coach.json`
3. **Defaults** — hard-coded inside `scripts/lib/state.mjs`

### Keys and Defaults

| Key | Default | Meaning |
|-----|---------|---------|
| `auto_correct` | `true` | Whether UserPromptSubmit hook fixes English prompts |
| `summary_language` | `null` | If set, Claude appends a summary in this language at end of every reply |
| `strictness` | `"standard"` | `gentle` / `standard` / `strict` — depth of correction |
| `domain_terms` | `[]` | Proper nouns and tool names to preserve verbatim |

### Canonical Load Snippet

Commands that need the resolved config should load it via the library, not re-implement the merge:

```bash
node -e "
  const { resolveConfig } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.mjs');
  console.log(JSON.stringify(resolveConfig(process.cwd())));
"
```

The output is a plain JSON object with the four keys above plus any project-specific extras.

### Strictness Reference

| Level | Behavior |
|-------|----------|
| `gentle` | Only fix clear errors. Accept informal English. |
| `standard` | Fix errors + improve awkward phrasing. (default) |
| `strict` | Fix everything + suggest more natural alternatives. |

### Writing Config

Commands that update config should only ever write to the project file (`.english-buddy.json` in cwd). Do not write to the global file from a command — that is the user's responsibility. The `/config --set key=value` command implements this.
