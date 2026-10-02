import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

// The plugin was named claude-english-buddy until 0.8.0. Its data folder and
// project config carried that name; both must keep working after the rename.

test("history kept under the old plugin name is copied into the new data folder once", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "eb-rename-"));
  const legacy = path.join(root, "claude-english-buddy-xiaolai", "history");
  fs.mkdirSync(legacy, { recursive: true });
  fs.writeFileSync(path.join(legacy, "2026-09-30.jsonl"), '{"mode":"clean"}\n');
  const prev = process.env.CLAUDE_PLUGIN_DATA;
  process.env.CLAUDE_PLUGIN_DATA = path.join(root, "english-buddy-xiaolai");
  try {
    const { listHistoryDates } = await import(`../scripts/lib/state.mjs?case=${Date.now()}`);
    assert.deepEqual(listHistoryDates(), ["2026-09-30"]);
    assert.ok(fs.existsSync(path.join(legacy, "2026-09-30.jsonl")), "the old history stays in place");
  } finally {
    if (prev == null) delete process.env.CLAUDE_PLUGIN_DATA;
    else process.env.CLAUDE_PLUGIN_DATA = prev;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a project config under the old name is read when the new one is absent, and the new one wins", async () => {
  const { loadProjectConfig } = await import("../scripts/lib/state.mjs");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eb-config-"));
  try {
    fs.writeFileSync(path.join(dir, ".claude-english-buddy.json"), '{"strictness":"strict"}');
    assert.equal(loadProjectConfig(dir).strictness, "strict");
    fs.writeFileSync(path.join(dir, ".english-buddy.json"), '{"strictness":"gentle"}');
    assert.equal(loadProjectConfig(dir).strictness, "gentle");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
