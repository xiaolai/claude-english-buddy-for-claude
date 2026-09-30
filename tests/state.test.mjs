import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { logCorrection, logClean, readToday, readDay } from "../scripts/lib/state.mjs";

function withTempData(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ec-test-"));
  const prev = process.env.CLAUDE_PLUGIN_DATA;
  process.env.CLAUDE_PLUGIN_DATA = dir;
  try {
    fn(dir);
  } finally {
    if (prev == null) delete process.env.CLAUDE_PLUGIN_DATA;
    else process.env.CLAUDE_PLUGIN_DATA = prev;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("logCorrection creates a JSONL entry", () => {
  withTempData(() => {
    logCorrection({
      mode: "correct",
      original: "autentication",
      corrected: "authentication",
      annotations: "(autentication>authentication)",
    });
    const records = readToday();
    assert.equal(records.length, 1);
    assert.equal(records[0].mode, "correct");
    assert.equal(records[0].original, "autentication");
    assert.equal(records[0].corrected, "authentication");
  });
});

test("logClean creates a clean entry", () => {
  withTempData(() => {
    logClean();
    const records = readToday();
    assert.equal(records.length, 1);
    assert.equal(records[0].mode, "clean");
  });
});

test("multiple entries append to same file", () => {
  withTempData(() => {
    logCorrection({ mode: "correct", original: "a", corrected: "b" });
    logCorrection({ mode: "translate", original: "c", corrected: "d" });
    logClean();
    const records = readToday();
    assert.equal(records.length, 3);
    assert.equal(records[0].mode, "correct");
    assert.equal(records[1].mode, "translate");
    assert.equal(records[2].mode, "clean");
  });
});

test("readDay returns empty for non-existent date", () => {
  withTempData(() => {
    const records = readDay("2020-01-01");
    assert.deepEqual(records, []);
  });
});

test("records carry the session id passed by the hook", () => {
  withTempData(() => {
    logCorrection({ mode: "correct", original: "a", corrected: "b", session: "sess-42" });
    logClean({ session: "sess-42" });
    const records = readToday();
    assert.deepEqual(records.map((r) => r.session), ["sess-42", "sess-42"]);
  });
});
