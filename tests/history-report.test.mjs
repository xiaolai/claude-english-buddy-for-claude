// End-to-end tests for scripts/history-report.mjs, the CLI the Codex skills
// call to read correction history.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "scripts", "history-report.mjs");
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceb-report-"));
  try { return fn(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

function writeHistory(dataDir, records) {
  fs.mkdirSync(path.join(dataDir, "history"), { recursive: true });
  fs.writeFileSync(path.join(dataDir, "history", `${today}.jsonl`), records.map((r) => JSON.stringify(r)).join("\n") + "\n");
}

function run(args, env) {
  return spawnSync(process.execPath, [CLI, ...args], {
    env: { PATH: process.env.PATH, HOME: os.tmpdir(), ...env },
    encoding: "utf8",
  });
}

const RECORDS = [
  { ts: `${today}T01:00:00Z`, mode: "correct", original: "its ok", corrected: "it's ok", annotations: "its → it's (apostrophe)" },
  { ts: `${today}T02:00:00Z`, mode: "clean" },
];

test("--host codex reads the Codex plugin data dir and ignores an inherited CLAUDE_PLUGIN_DATA", () => {
  withDir((dir) => {
    const codexData = path.join(dir, "codex", "plugins", "data", "english-buddy-xiaolai");
    writeHistory(codexData, RECORDS);
    const decoy = path.join(dir, "decoy");
    writeHistory(decoy, [{ mode: "clean" }]);
    const r = run(["--host", "codex", "today"], { CODEX_HOME: path.join(dir, "codex"), CLAUDE_PLUGIN_DATA: decoy });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.dataDir, codexData);
    assert.equal(out.today.total, 2);
    assert.equal(out.today.corrections, 1);
    assert.equal(out.today.patterns[0].count, 1);
  });
});

test("period honours --days and --top", () => {
  withDir((dir) => {
    writeHistory(dir, [
      ...RECORDS,
      { ts: `${today}T03:00:00Z`, mode: "correct", original: "a", corrected: "b", annotations: "teh → the (spelling)" },
    ]);
    const r = run(["--data-dir", dir, "period", "--days", "7", "--top", "1"], {});
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.days, 7);
    assert.equal(out.stats.total, 3);
    assert.equal(out.stats.patterns.length, 1);
    assert.equal(out.trend.length, 1);
  });
});

test("--host codex with no data dir exits 3 with a reason", () => {
  withDir((dir) => {
    const r = run(["--host", "codex", "today"], { CODEX_HOME: dir });
    assert.equal(r.status, 3);
    assert.match(r.stderr, /has not recorded a prompt yet/);
  });
});

test("bad arguments exit 2", () => {
  assert.equal(run(["--data-dir", os.tmpdir(), "period", "--days", "0"], {}).status, 2);
  assert.equal(run(["--data-dir", os.tmpdir(), "weekly"], {}).status, 2);
  assert.equal(run(["--host", "claude", "today"], {}).status, 2);
});
