import test from "node:test";
import assert from "node:assert/strict";

import { detectLanguage, shouldSkip, detectMode } from "../scripts/lib/detect.mjs";

test("detectLanguage returns english for ASCII text", () => {
  const r = detectLanguage("refactor the authentication module");
  assert.equal(r.mode, "correct");
  assert.equal(r.language, "english");
  assert.ok(r.ratio >= 80);
});

test("detectLanguage returns non-english for Chinese", () => {
  const r = detectLanguage("重构认证模块，职责太多了");
  assert.equal(r.mode, "translate");
  assert.equal(r.language, "non-english");
  assert.ok(r.ratio < 80);
});

test("detectLanguage returns non-english for mixed CJK+English", () => {
  const r = detectLanguage("把 auth module 里的 session handler 重构一下");
  assert.equal(r.mode, "translate");
});

test("detectLanguage handles empty string", () => {
  const r = detectLanguage("");
  assert.equal(r.mode, "skip");
});

test("shouldSkip returns true for slash commands", () => {
  assert.equal(shouldSkip("/commit"), true);
  assert.equal(shouldSkip("/codex-toolkit:audit"), true);
});

test("shouldSkip returns true for very short prompts", () => {
  assert.equal(shouldSkip("ok"), true);
  assert.equal(shouldSkip("yes"), true);
});

test("shouldSkip returns false for normal prompts", () => {
  assert.equal(shouldSkip("refactor the authentication module"), false);
});

test("shouldSkip returns true for URLs", () => {
  assert.equal(shouldSkip("https://github.com/foo/bar"), true);
});

test("shouldSkip returns true for code patterns", () => {
  assert.equal(shouldSkip("npm install express"), true);
  assert.equal(shouldSkip("docker run -it ubuntu"), true);
});

test("shouldSkip returns false for Chinese (long enough)", () => {
  assert.equal(shouldSkip("重构认证模块，职责太多了"), false);
});

test("detectMode returns refine for :: prefix", () => {
  const r = detectMode(":: investigate why auth is slow");
  assert.equal(r.mode, "refine");
  assert.equal(r.text, "investigate why auth is slow");
});

test("detectMode returns correct for English", () => {
  const r = detectMode("refactor the autentication modul");
  assert.equal(r.mode, "correct");
});

test("detectMode returns translate for Chinese", () => {
  const r = detectMode("重构认证模块，职责太多了");
  assert.equal(r.mode, "translate");
});

test("detectMode returns skip for slash commands", () => {
  const r = detectMode("/commit");
  assert.equal(r.mode, "skip");
});

test("shouldSkip returns true for a Codex skill invocation", () => {
  assert.equal(shouldSkip("$english-buddy-review fix the typos in README"), true);
  assert.equal(detectMode("$english-buddy-today").mode, "skip");
});
