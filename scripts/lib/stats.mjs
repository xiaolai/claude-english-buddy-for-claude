// Trend analysis — compute stats from correction history.

import { readDay, readToday, readLastNDays, localDate } from "./state.mjs";
import { parseAnnotations } from "./annotations.mjs";

function countByMode(records) {
  const counts = { correct: 0, translate: 0, refine: 0, clean: 0 };
  for (const r of records) {
    const mode = r.mode || "clean";
    counts[mode] = (counts[mode] || 0) + 1;
  }
  return counts;
}

function extractPatterns(records) {
  const patterns = {};
  for (const r of records) {
    if (r.mode === "translate") continue; // translate annotations carry a language tag, not diff pairs
    const fixes = parseAnnotations(r.annotations);
    for (const fix of fixes) {
      const key = `${fix.original.toLowerCase()}\u0000${fix.corrected.toLowerCase()}`;
      const entry = patterns[key] || { original: fix.original, corrected: fix.corrected, count: 0, category: fix.category };
      entry.count += 1;
      // Prefer the most-recent category label when present.
      if (fix.category) entry.category = fix.category;
      patterns[key] = entry;
    }
  }
  return Object.values(patterns).sort((a, b) => b.count - a.count);
}

export function todayStats() {
  const records = readToday();
  const total = records.length;
  const counts = countByMode(records);
  const corrections = total - counts.clean;
  const errorRate = total > 0 ? Math.round((corrections / total) * 100) : 0;
  const patterns = extractPatterns(records);

  return {
    date: localDate(),
    total,
    corrections,
    clean: counts.clean,
    translations: counts.translate,
    refinements: counts.refine,
    errorRate,
    patterns,
    records: records.filter((r) => r.mode !== "clean"),
  };
}

export function periodStats(days) {
  const records = readLastNDays(days);
  const total = records.length;
  const counts = countByMode(records);
  const corrections = total - counts.clean;
  const errorRate = total > 0 ? Math.round((corrections / total) * 100) : 0;
  const patterns = extractPatterns(records);

  return {
    days,
    total,
    corrections,
    clean: counts.clean,
    translations: counts.translate,
    refinements: counts.refine,
    errorRate,
    patterns,
  };
}

export function weeklyTrend(weeks = 4) {
  const trend = [];
  const now = new Date();
  for (let w = 0; w < weeks; w++) {
    const end = new Date(now);
    end.setDate(end.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const records = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      records.push(...readDay(localDate(d)));
    }

    const total = records.length;
    const counts = countByMode(records);
    const corrections = total - counts.clean;
    const errorRate = total > 0 ? Math.round((corrections / total) * 100) : 0;
    const avgPerDay = total > 0 ? Math.round((corrections / 7) * 10) / 10 : 0;

    trend.push({
      weekStart: localDate(start),
      weekEnd: localDate(end),
      total,
      corrections,
      errorRate,
      avgPerDay,
    });
  }
  return trend.reverse();
}
