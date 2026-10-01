// Correction history — persists every correction for trend analysis and reports.
// Storage: $CLAUDE_PLUGIN_DATA/history/YYYY-MM-DD.jsonl, one file per LOCAL calendar day.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const PLUGIN_DATA_ENV = "CLAUDE_PLUGIN_DATA";
const FALLBACK_DIR = path.join(os.tmpdir(), "claude-english-buddy");
const CONFIG_NAME = ".claude-english-buddy.json";

function getDataDir() {
  const pluginData = process.env[PLUGIN_DATA_ENV];
  return pluginData
    ? path.join(pluginData, "history")
    : path.join(FALLBACK_DIR, "history");
}

function ensureDataDir() {
  const dir = getDataDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// History is bucketed by the user's local calendar day. Never format a
// bucket date with toISOString(): that is the UTC day, which in UTC+8 files
// everything typed before 08:00 under the previous date.
export function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// The local date n days before today.
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDate(d);
}

// Noon, so stepping by setDate() never lands on a DST-skipped midnight.
function parseLocalDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function todayFile() {
  return path.join(ensureDataDir(), `${localDate()}.jsonl`);
}

function dateFile(date) {
  return path.join(getDataDir(), `${date}.jsonl`);
}

// The hook passes session_id from its stdin (Claude Code and Codex both send
// it); CLAUDE_SESSION_ID is kept as a fallback for older callers.
function sessionOf(entry) {
  return entry.session || process.env.CLAUDE_SESSION_ID || null;
}

export function logCorrection(entry) {
  const record = {
    ts: new Date().toISOString(),
    mode: entry.mode,
    original: entry.original,
    corrected: entry.corrected,
    annotations: entry.annotations || null,
    pattern: entry.pattern || null,
    session: sessionOf(entry),
  };
  fs.appendFileSync(todayFile(), JSON.stringify(record) + "\n", "utf8");
  return record;
}

export function logClean(entry = {}) {
  const record = {
    ts: new Date().toISOString(),
    mode: "clean",
    original: null,
    corrected: null,
    session: sessionOf(entry),
  };
  fs.appendFileSync(todayFile(), JSON.stringify(record) + "\n", "utf8");
  return record;
}

export function readDay(date) {
  const file = dateFile(date);
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); }
      catch { return null; }
    })
    .filter(Boolean);
}

export function readToday() {
  return readDay(localDate());
}

// Inclusive range of local dates, each "YYYY-MM-DD".
export function readRange(startDate, endDate) {
  const records = [];
  const end = parseLocalDate(endDate);
  for (let d = parseLocalDate(startDate); d <= end; d.setDate(d.getDate() + 1)) {
    records.push(...readDay(localDate(d)));
  }
  return records;
}

export function readLastNDays(n) {
  return readRange(daysAgo(n - 1), localDate());
}

export function listHistoryDates() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.replace(".jsonl", ""))
    .sort();
}

// --- Project config ---

export function loadProjectConfig(cwd) {
  const configPath = path.join(cwd || process.cwd(), CONFIG_NAME);
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return {};
  }
}

export function loadGlobalConfig() {
  const configPath = path.join(os.homedir(), ".claude", "hooks", "prompt_coach.json");
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return {};
  }
}

export function resolveConfig(cwd) {
  const global = loadGlobalConfig();
  const project = loadProjectConfig(cwd);
  return {
    coaching_mode: project.coaching_mode ?? global.coaching_mode ?? "automatic",
    sample_rate: project.sample_rate ?? global.sample_rate ?? 1,
    timeout_seconds: project.timeout_seconds ?? global.timeout_seconds ?? 5,
    auto_correct: project.auto_correct ?? global.auto_correct ?? true,
    summary_language: project.summary_language ?? global.summary_language ?? null,
    strictness: project.strictness ?? global.strictness ?? "standard",
    domain_terms: [
      ...(global.domain_terms || []),
      ...(project.domain_terms || []),
    ],
  };
}
