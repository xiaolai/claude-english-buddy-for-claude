// History files are bucketed by the user's local calendar day. A UTC bucket
// files anything typed before 08:00 in UTC+8 under the previous date, so the
// "today" report shows the wrong prompts. Pin a zone far from UTC to prove it.
process.env.TZ = "Asia/Shanghai";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const { localDate, logClean, readDay, readLastNDays } = await import("../scripts/lib/state.mjs");

test("localDate uses the local calendar day, not the UTC one", () => {
  // 02:00 on 1 Oct in Shanghai is 18:00 on 30 Sep in UTC.
  const d = new Date(2026, 9, 1, 2, 0, 0);
  assert.equal(d.toISOString().slice(0, 10), "2026-09-30");
  assert.equal(localDate(d), "2026-10-01");
});

test("records are filed and read under the local date", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceb-date-"));
  const prev = process.env.CLAUDE_PLUGIN_DATA;
  process.env.CLAUDE_PLUGIN_DATA = dir;
  try {
    logClean();
    assert.equal(readDay(localDate()).length, 1);
    assert.deepEqual(fs.readdirSync(path.join(dir, "history")), [`${localDate()}.jsonl`]);
    assert.equal(readLastNDays(1).length, 1);
    assert.equal(readLastNDays(7).length, 1);
  } finally {
    if (prev == null) delete process.env.CLAUDE_PLUGIN_DATA;
    else process.env.CLAUDE_PLUGIN_DATA = prev;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
