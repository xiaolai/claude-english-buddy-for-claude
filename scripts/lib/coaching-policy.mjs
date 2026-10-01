import { createHash } from 'node:crypto';
export function coachingPolicy(config, prompt, env = process.env) {
 const timeout = Math.max(1, Math.min(30, Number(config.timeout_seconds) || 5));
 const rate = Math.max(0, Math.min(1, Number(config.sample_rate ?? 1)));
 const explicit = prompt.trimStart().startsWith('::');
 const sample = createHash('sha256').update(prompt).digest().readUInt32BE(0) / 2 ** 32;
 const enabled = explicit || (config.coaching_mode !== 'on-demand' && sample < rate);
 const unsupported = env.CLAUDE_CODE_USE_VERTEX === '1' || env.CLAUDE_CODE_USE_FOUNDRY === '1';
 let url = null, error = null;
 try {
  const base = new URL(env.CLAUDE_ENGLISH_BUDDY_BASE_URL || env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com');
  if (base.username || base.password || base.search || base.hash || !['https:', 'http:'].includes(base.protocol)) throw new Error();
  if (base.protocol === 'http:' && !['localhost','127.0.0.1','[::1]'].includes(base.hostname)) throw new Error();
  url = base.href.replace(/\/$/, '').replace(/\/v1$/, '') + '/v1/messages';
 } catch { error = 'Invalid coaching API base URL; use HTTPS or a loopback HTTP endpoint.'; }
 if (unsupported && !env.CLAUDE_ENGLISH_BUDDY_BASE_URL) error = 'This Claude provider has no coaching adapter. Configure an explicit coaching endpoint or use on-demand review; no prompt was sent.';
 return { enabled, timeout, url, error, model: env.CLAUDE_ENGLISH_BUDDY_MODEL || 'claude-haiku-4-5-20251001' };
}

// A conservative mechanical floor; this does not prove semantic equivalence.
export function preservesLiterals(original, rewritten) {
 const literals = [...original.matchAll(/`[^`]+`|\b\d+(?:\.\d+)?(?:\s*(?:ms|milliseconds|seconds|minutes|px|rem|%))?/g)].map(m=>m[0]);
 return literals.every(value=>rewritten.includes(value));
}
