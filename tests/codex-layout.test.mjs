// Invariants of the Codex layout (.codex-plugin/ + codex/skills/). The tree is
// hand-built; these checks catch the defects the converter would reintroduce
// and that a generic plugin linter does not know about.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = path.join(ROOT, "codex", "skills");
const PREFIX = "english-buddy-";
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const skills = fs
  .readdirSync(SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => ({ dir: e.name, text: fs.readFileSync(path.join(SKILLS, e.name, "SKILL.md"), "utf8") }));

test("every skill has name and description frontmatter only, name matching its directory", () => {
  assert.ok(skills.length > 0);
  for (const { dir, text } of skills) {
    assert.ok(dir.startsWith(PREFIX), `${dir}: skill names carry the ${PREFIX} prefix`);
    const match = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(match, `${dir}: missing frontmatter`);
    const keys = match[1].split("\n").map((l) => l.slice(0, l.indexOf(":")));
    assert.deepEqual(keys, ["name", "description"], `${dir}: frontmatter keys`);
    assert.equal(match[1].split("\n")[0], `name: ${dir}`);
    const desc = match[1].split("\n")[1].slice("description: ".length);
    const value = desc.startsWith('"') ? JSON.parse(desc) : desc;
    assert.ok(value.length > 40, `${dir}: description too short to route on`);
  }
});

test("no Claude-only constructs in Codex skills", () => {
  const forbidden = [
    [/\$\{?CLAUDE_PLUGIN_ROOT/, "CLAUDE_PLUGIN_ROOT is unset in Codex skill commands"],
    [/\$\{?CLAUDE_PLUGIN_DATA/, "CLAUDE_PLUGIN_DATA is unset (or foreign) in Codex skill commands"],
    [/\$ARGUMENTS/, "Codex skills get no argument substitution"],
    [/AskUserQuestion|\bTask tool\b|`Task`|\bGlob\b/, "Claude Code tool name"],
    [/\/english-buddy:/, "Claude Code slash command"],
    [/model: |haiku|sonnet/i, "Claude model pin"],
  ];
  for (const { dir, text } of skills) {
    for (const [re, why] of forbidden) assert.doesNotMatch(text, re, `${dir}: ${why}`);
  }
});

test("every $skill reference resolves and every $ROOT script exists", () => {
  const names = new Set(skills.map((s) => s.dir));
  for (const { dir, text } of skills) {
    for (const [, ref] of text.matchAll(/\$(english-buddy-[a-z-]*[a-z])/g)) {
      assert.ok(names.has(ref), `${dir}: dangling reference $${ref}`);
    }
    for (const [, rel] of text.matchAll(/\$ROOT\/([\w./-]+)/g)) {
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${dir}: missing $ROOT/${rel}`);
    }
  }
});

test("Codex manifest points at the skills tree and matches the Claude version", () => {
  const codex = readJson(".codex-plugin/plugin.json");
  const claude = readJson(".claude-plugin/plugin.json");
  const listing = readJson(".claude-plugin/marketplace.json").plugins.find((p) => p.name === claude.name);
  assert.equal(codex.name, claude.name);
  assert.equal(codex.version, claude.version);
  assert.equal(listing.version, claude.version);
  assert.equal(codex.skills, "./codex/skills/");
  // Codex turns a plugin's commands/*.md into extra skills unless the manifest
  // sets commands to []; those would duplicate codex/skills/ and expose the
  // commands/shared/ partials as skills.
  assert.deepEqual(codex.commands, []);
  assert.ok(codex.interface.defaultPrompt.length <= 3);
  for (const p of codex.interface.defaultPrompt) assert.ok(p.length <= 128, `defaultPrompt over 128 chars: ${p}`);
});

test("hooks are shared: Codex loads the root hooks/hooks.json, so no codex/hooks copy exists", () => {
  // A manifest "hooks" path replaces the root file rather than adding to it (checked on Codex 0.159.2),
  // so a codex/hooks copy is either dead or a second source of truth to keep in sync.
  assert.ok(!fs.existsSync(path.join(ROOT, "codex", "hooks")), "keep one hooks file: hooks/hooks.json");
  const hooks = readJson("hooks/hooks.json").hooks;
  const codexEvents = new Set(["SessionStart", "UserPromptSubmit", "PreToolUse", "PostToolUse", "PermissionRequest",
    "PreCompact", "PostCompact", "SubagentStart", "SubagentStop", "Stop", "SessionEnd"]);
  for (const [event, groups] of Object.entries(hooks)) {
    assert.ok(codexEvents.has(event), `${event} is not a Codex hook event`);
    for (const g of groups) for (const h of g.hooks) {
      // Both hosts export CLAUDE_PLUGIN_ROOT to hook commands; quoting survives spaces in the path.
      assert.match(h.command, /"\$\{CLAUDE_PLUGIN_ROOT\}\//, `${event}: unquoted or missing plugin root`);
      // Codex clamps SessionEnd hooks to 3 s and prints a warning in every session when asked for more.
      if (event === "SessionEnd") assert.ok((h.timeout ?? 1) <= 3, `SessionEnd timeout ${h.timeout} > 3 s`);
    }
  }
});
