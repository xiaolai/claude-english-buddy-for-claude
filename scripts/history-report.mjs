#!/usr/bin/env node
// Correction-history reports as JSON, for skills that cannot rely on the
// host to point them at the plugin's data directory.
//
// Usage:
//   node history-report.mjs [--host codex | --data-dir <dir>] today
//   node history-report.mjs [--host codex | --data-dir <dir>] period [--days N] [--top N]
//
// Data directory, in priority order:
//   --data-dir <dir>  explicit.
//   --host codex      the directory Codex gives this plugin's hooks as
//                     PLUGIN_DATA: $CODEX_HOME/plugins/data/claude-english-buddy-<marketplace>.
//                     An inherited CLAUDE_PLUGIN_DATA is ignored: Codex does not set
//                     it for skill commands, so any value there belongs to another process.
//   (neither)         $CLAUDE_PLUGIN_DATA, as Claude Code sets it.
//
// Exit codes: 0 = report printed; 2 = usage error; 3 = no data directory found.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const PLUGIN = "claude-english-buddy";

function fail(code, message) {
  process.stderr.write(`history-report: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = { host: null, dataDir: null, report: null, days: 30, top: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) fail(2, `${arg} needs a value`);
      return v;
    };
    const count = () => {
      const v = value();
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1) fail(2, `${arg} must be a positive integer, got ${JSON.stringify(v)}`);
      return n;
    };
    if (arg === "--host") opts.host = value();
    else if (arg === "--data-dir") opts.dataDir = value();
    else if (arg === "--days") opts.days = count();
    else if (arg === "--top") opts.top = count();
    else if (!arg.startsWith("-") && opts.report === null) opts.report = arg;
    else fail(2, `unexpected argument ${JSON.stringify(arg)}`);
  }
  if (opts.host !== null && opts.host !== "codex") fail(2, `unknown --host ${JSON.stringify(opts.host)} (only "codex")`);
  if (opts.report !== "today" && opts.report !== "period") fail(2, "report must be \"today\" or \"period\"");
  return opts;
}

function findCodexDataDir(codexHome) {
  const base = path.join(codexHome, "plugins", "data");
  if (!fs.existsSync(base)) return null;
  const candidates = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(`${PLUGIN}-`))
    .map((e) => path.join(base, e.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return candidates[0] || null;
}

function resolveDataDir(opts) {
  if (opts.dataDir) return path.resolve(opts.dataDir);
  if (opts.host === "codex") {
    const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
    const dir = findCodexDataDir(codexHome);
    if (!dir) {
      fail(3, `no ${PLUGIN} data directory under ${path.join(codexHome, "plugins", "data")}; ` +
        "the coaching hook has not recorded a prompt yet (trust it with /hooks, then submit a prompt)");
    }
    return dir;
  }
  if (process.env.CLAUDE_PLUGIN_DATA) return process.env.CLAUDE_PLUGIN_DATA;
  return fail(3, "no data directory: pass --host codex or --data-dir, or set CLAUDE_PLUGIN_DATA");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const dataDir = resolveDataDir(opts);
  // state.mjs reads CLAUDE_PLUGIN_DATA on every call, so this must be set
  // before any report function runs.
  process.env.CLAUDE_PLUGIN_DATA = dataDir;
  const { readDay, daysAgo } = await import("./lib/state.mjs");
  const { todayStats, periodStats, weeklyTrend } = await import("./lib/stats.mjs");

  let report;
  if (opts.report === "today") {
    const yRecords = readDay(daysAgo(1));
    const yCorrections = yRecords.filter((r) => r.mode !== "clean").length;
    report = {
      today: todayStats(),
      yesterday: {
        total: yRecords.length,
        corrections: yCorrections,
        errorRate: yRecords.length > 0 ? Math.round((yCorrections / yRecords.length) * 100) : 0,
      },
      week: periodStats(7),
      trend: weeklyTrend(4),
    };
  } else {
    const stats = periodStats(opts.days);
    if (opts.top !== null) stats.patterns = stats.patterns.slice(0, opts.top);
    report = { days: opts.days, top: opts.top, stats, trend: weeklyTrend(Math.ceil(opts.days / 7)) };
  }
  process.stdout.write(JSON.stringify({ dataDir, ...report }) + "\n");
}

main();
