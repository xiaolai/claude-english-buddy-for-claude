// End-to-end tests for the UserPromptSubmit hook's wire format.
//
// Claude Code and Codex both read hook context from
// hookSpecificOutput.additionalContext. A top-level additionalContext is
// dropped silently by both, so the model never sees the corrected,
// translated or refined prompt. These tests run the real hook process on
// prompts that need no API call, so they run offline.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const HOOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "scripts", "prompt-coach-hook.mjs");

function runHook(input, projectConfig) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceb-hook-"));
  try {
    const home = path.join(dir, "home");
    const cwd = path.join(dir, "project");
    fs.mkdirSync(home);
    fs.mkdirSync(cwd);
    if (projectConfig) {
      fs.writeFileSync(path.join(cwd, ".english-buddy.json"), JSON.stringify(projectConfig));
    }
    // An empty HOME keeps the user's global config out of the test, and an
    // empty credential environment guarantees no network call.
    const env = { PATH: process.env.PATH, HOME: home, CLAUDE_PLUGIN_DATA: path.join(dir, "data") };
    const result = spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify({ cwd, ...input }),
      env,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `hook exited ${result.status}: ${result.stderr}`);
    return result.stdout.trim();
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("summary instruction is emitted under hookSpecificOutput", () => {
  const stdout = runHook({ prompt: "/help", session_id: "s-1" }, { summary_language: "Chinese" });
  const out = JSON.parse(stdout);
  assert.equal(out.additionalContext, undefined, "top-level additionalContext is ignored by both hosts");
  assert.equal(out.hookSpecificOutput?.hookEventName, "UserPromptSubmit");
  assert.match(out.hookSpecificOutput.additionalContext, /Chinese Summary/);
});

test("skip-mode prompt without summary language emits nothing", () => {
  assert.equal(runHook({ prompt: "/help" }), "");
});

test("empty :: refine blocks with a reason and no context", () => {
  const out = JSON.parse(runHook({ prompt: "::" }));
  assert.equal(out.decision, "block");
  assert.match(out.reason, /Nothing to refine/);
  assert.equal(out.hookSpecificOutput, undefined);
});
