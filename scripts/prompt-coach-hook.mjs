#!/usr/bin/env node
// UserPromptSubmit hook — auto-correct, translate, or refine prompts.
// Also injects summary_language instruction when configured.
//
// Registered globally in hooks/hooks.json: UserPromptSubmit carries no tool
// name, so the hook config layer cannot filter on prompt content. Filtering
// therefore lives here, via shouldSkip()/detectMode() in scripts/lib/detect.mjs,
// which skips — before any API call — prompts that are empty, slash commands
// or $skill invocations, shorter than 10 characters with fewer than 3 words,
// or opening with a URL/shell-command/bracket token. A skipped prompt produces no systemMessage
// and no correction; the only thing it can still emit is the summary-language
// instruction, when summary_language is configured.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { coachingPolicy, preservesLiterals } from "./lib/coaching-policy.mjs";
let policy;
let timing;

import { detectMode } from "./lib/detect.mjs";
import { logCorrection, logClean, resolveConfig } from "./lib/state.mjs";
import {
  parseAnnotations,
  formatAnnotationsForStorage,
  formatAnnotationsForDisplay,
} from "./lib/annotations.mjs";

function readStdin() {
  return JSON.parse(fs.readFileSync(0, "utf8").trim() || "{}");
}

// Pending user-visible warning (auth failure). Drained on next emit().
let authWarning = null;
let hadFailure = false;

// Callers pass { additionalContext, systemMessage } or { decision, reason }.
// Context must travel as hookSpecificOutput.additionalContext: Claude Code and
// Codex both drop a top-level additionalContext without an error, so the model
// would never see the corrected, translated or refined prompt.
function emit({ additionalContext, ...rest }) {
  const obj = { ...rest };
  if (additionalContext) {
    obj.hookSpecificOutput = { hookEventName: "UserPromptSubmit", additionalContext: "Coaching is supplementary. The original user prompt is authoritative; preserve literal code, names, constraints and intent.\n" + additionalContext };
  }
  if (authWarning) {
    hadFailure = true;
    obj.systemMessage = obj.systemMessage ? `${authWarning}\n${obj.systemMessage}` : authWarning;
    authWarning = null;
  }
  process.stdout.write(JSON.stringify(obj) + "\n");
}

// Used by main() in fallback branches that would otherwise return silently.
// Ensures auth warnings still surface even when there's no summary context.
function emitFallback(summaryCtx) {
  if (summaryCtx || authWarning) {
    emit(summaryCtx ? { additionalContext: summaryCtx } : {});
  }
}

// Resolve API credentials with macOS keychain fallback.
// Order: CLAUDE_CODE_OAUTH_TOKEN → ANTHROPIC_API_KEY → macOS keychain.
// Returns { token, expired } or null.
function getCredentials() {
  const envOauth = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (envOauth) return { token: envOauth, expired: false };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) return { token: apiKey, expired: false };

  if (process.platform !== "darwin") return null;

  const result = spawnSync("security", [
    "find-generic-password", "-s", "Claude Code-credentials", "-w",
  ], { encoding: "utf8", timeout: 5_000 });
  if (result.error || result.status !== 0) { authWarning = "[claude-english-buddy] Coaching request failed or timed out; original prompt is unchanged."; return null; }

  try {
    const creds = JSON.parse(result.stdout.trim());
    const token = creds?.claudeAiOauth?.accessToken;
    const expiresAt = creds?.claudeAiOauth?.expiresAt;
    if (!token) return null;
    return { token, expired: Boolean(expiresAt && Date.now() > expiresAt) };
  } catch {
    return null;
  }
}

// Route to Bedrock when Claude Code itself is running on Bedrock
// (CLAUDE_CODE_USE_BEDROCK=1). Otherwise use the Anthropic API.
function callHaiku(systemPrompt, userText) {
  if (process.env.CLAUDE_CODE_USE_BEDROCK === "1") {
    return callHaikuBedrock(systemPrompt, userText);
  }
  return callHaikuAnthropic(systemPrompt, userText);
}

function callHaikuAnthropic(systemPrompt, userText) {
  // Note: claude CLI deadlocks when spawned inside hooks, so we call the API directly via curl.
  const creds = getCredentials();
  if (!creds) { authWarning = "[claude-english-buddy] Coaching unavailable: no credentials. Original prompt is unchanged."; return null; }

  if (creds.expired) {
    authWarning = "[claude-english-buddy] OAuth token expired. Restart Claude Code to refresh the keychain.";
    return null;
  }

  // OAuth tokens (sk-ant-oat...) require Authorization: Bearer; API keys use x-api-key.
  const authHeader = creds.token.startsWith("sk-ant-oat")
    ? `Authorization: Bearer ${creds.token}`
    : `x-api-key: ${creds.token}`;

  const body = JSON.stringify({
    model: policy.model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userText }],
  });

  // Synchronous HTTP via curl — can't use claude CLI (deadlocks inside hooks)
  // Credentials and prompt go through stdin, never process arguments.
  const curlConfig = [
    `url = ${JSON.stringify(policy.url)}`,
    `header = ${JSON.stringify('content-type: application/json')}`,
    `header = ${JSON.stringify(authHeader)}`,
    `header = ${JSON.stringify('anthropic-version: 2023-06-01')}`,
    `data = ${JSON.stringify(body)}`,
  ].join('\n');
  const result = spawnSync("curl", ["-s", "--max-time", String(policy.timeout), "--config", "-"],
    { input: curlConfig, encoding: "utf8", timeout: (policy.timeout + 1) * 1000 });

  if (result.error || result.status !== 0) { authWarning = "[claude-english-buddy] Coaching request failed or timed out; original prompt is unchanged."; return null; }

  try {
    const response = JSON.parse(result.stdout);
    if (response.error) {
      authWarning = "[claude-english-buddy] Coaching service returned an error; original prompt is unchanged.";
      if (response.error.type === "authentication_error") {
        authWarning = "[claude-english-buddy] Authentication failed. If you authenticate via `claude setup-token`, restart Claude Code to refresh the OAuth token.";
      }
      return null;
    }
    const text = response.content?.[0]?.text || "";
    return text.trim() || null;
  } catch {
    return null;
  }
}

// AWS Bedrock path — used when CLAUDE_CODE_USE_BEDROCK=1.
// Shells out to `aws bedrock-runtime invoke-model`, which picks up
// AWS_PROFILE/AWS_REGION/credentials from the environment. Requires the aws
// CLI on PATH (already a prerequisite for running Claude Code on Bedrock).
function callHaikuBedrock(systemPrompt, userText) {
  const region  = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
  const modelId = process.env.CLAUDE_ENGLISH_BUDDY_BEDROCK_MODEL
               || "us.anthropic.claude-haiku-4-5-20251001-v1:0";

  // The Bedrock body differs from the Anthropic API: use anthropic_version
  // (not an HTTP header) and omit the top-level model field.
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userText }],
  });

  const suffix  = `ceb-${process.pid}-${Date.now()}`;
  const inFile  = path.join(os.tmpdir(), `${suffix}-in.json`);
  const outFile = path.join(os.tmpdir(), `${suffix}-out.json`);

  try {
    fs.writeFileSync(inFile, body, { encoding: "utf8", mode: 0o600 });

    const result = spawnSync("aws", [
      "bedrock-runtime", "invoke-model",
      "--model-id", modelId,
      "--region", region,
      "--body", `fileb://${inFile}`,
      "--content-type", "application/json",
      "--accept", "application/json",
      outFile,
    ], { encoding: "utf8", timeout: (policy.timeout + 1) * 1000 });

    if (result.error || result.status !== 0) { authWarning = "[claude-english-buddy] Coaching request failed or timed out; original prompt is unchanged."; return null; }

    const response = JSON.parse(fs.readFileSync(outFile, "utf8"));
    if (response.error) return null;
    const text = response.content?.[0]?.text || "";
    return text.trim() || null;
  } catch {
    return null;
  } finally {
    try { fs.unlinkSync(inFile); } catch {}
    try { fs.unlinkSync(outFile); } catch {}
  }
}

const SYSTEM_CORRECT = `You are an English language coach for a non-native speaker who uses AI coding tools daily.
The user's prompt will be processed by an AI assistant that understands them regardless of errors. Your job is to help the USER improve by showing corrections.

Rules:
- Fix spelling, grammar, punctuation, and word choice errors
- Improve awkward phrasing to sound natural
- Keep technical terms, code references, and tool names unchanged
- Keep command and skill invocations (tokens starting with / or $, such as /review or $my-skill) exactly as written: no backticks, no rewording
- Preserve the user's intent and structure exactly
- Do NOT restructure or expand the prompt — only correct errors
- Never emit a correction whose before and after sides are identical after trimming — only flag real changes
- Show the smallest token that actually changed, not the whole surrounding phrase (e.g. "html → HTML", not "rather than single html → rather than a single HTML file")
- Surface at most 3 corrections per prompt; pick the ones most worth learning from

Output format (strict):
- If the prompt has NO errors, output EXACTLY: CLEAN
- If the prompt has errors, output the corrected prompt on the first line, then a blank line, then ONE correction per line in the format:
    {wrong} → {right} ({short category})
  where {short category} is one or two words such as: missing article, acronym capitalization, verb tense, word choice, spelling, apostrophe, preposition, punctuation, capitalization, agreement.
  Do not add bullet markers; do not wrap in parentheses; do not repeat the corrected sentence.

Example input: "i seen the file but its missing comma"
Example output:
I saw the file, but it's missing a comma.

i → I (capitalization)
seen → saw (verb tense)
its → it's (apostrophe)`;

const SYSTEM_TRANSLATE = `You are a translator for a developer who uses AI coding tools.
Rules:
- Translate the user's text into natural, idiomatic English
- Keep ALL technical terms, code references, file paths, and tool names unchanged
- Preserve the intent and structure exactly
- Use imperative voice where appropriate for instructions
- Output EXACTLY two lines:
  Line 1: The English translation
  Line 2: The detected source language in parentheses, e.g. (Chinese) or (Japanese)
- Output ONLY the translation, no commentary`;

const SYSTEM_REFINE = `You are a prompt engineer. Rewrite the user's rough idea into a precise, effective prompt for an AI coding assistant.
Rules:
- Use imperative voice
- Be specific and actionable
- Add structure (numbered steps, categories) if the task is complex
- Expand vague requests into concrete instructions
- Keep technical terms intact
- Translate non-English to English
- Output ONLY the refined prompt, nothing else`;

function main() {
  const input = readStdin();
  const prompt = input.prompt || "";
  const cwd = input.cwd || process.cwd();
  const session = input.session_id || null;
  const config = resolveConfig(cwd);
  policy = coachingPolicy(config, prompt);
  timing = { started: Date.now(), session };

  // Build summary instruction
  let summaryCtx = "";
  if (config.summary_language) {
    summaryCtx = `After your response, add a brief summary in ${config.summary_language} under a --- separator. Summarize the key points, actions taken, and decisions made. Keep it concise (2-5 sentences). Label it: **${config.summary_language} Summary**`;
  }

  if (!policy.enabled) { if (summaryCtx) emit({ additionalContext: summaryCtx }); return; }
  if (policy.error) { authWarning = "[claude-english-buddy] " + policy.error; emitFallback(summaryCtx); return; }

  // Detect mode
  const detection = detectMode(prompt);

  if (detection.mode === "skip") {
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  if (detection.mode === "refine") {
    if (!detection.text) {
      emit({ decision: "block", reason: "Nothing to refine. Provide text after ::." });
      return;
    }

    const result = callHaiku(SYSTEM_REFINE, detection.text);
    if (!result) {
      emit({ decision: "block", reason: "Refinement failed." });
      return;
    }

    if (!preservesLiterals(detection.text, result)) { authWarning = "[claude-english-buddy] Refinement changed a literal; original prompt retained."; emitFallback(summaryCtx); return; }
    logCorrection({ mode: "refine", session, original: detection.text, corrected: result });

    let ctx = `The user requested prompt refinement. Suggested wording: ${result}. Preserve the original request's constraints whenever wording differs.`;
    if (summaryCtx) ctx += " " + summaryCtx;
    emit({ additionalContext: ctx, systemMessage: `Refined: ${result}` });
    return;
  }

  if (!config.auto_correct) {
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  if (detection.mode === "translate") {
    const result = callHaiku(SYSTEM_TRANSLATE, detection.text);
    if (!result) {
      emitFallback(summaryCtx);
      return;
    }

    const lines = result.split("\n").filter(Boolean);
    const translated = lines[0] || result;
    const sourceLang = lines[1] || "";

    if (!preservesLiterals(detection.text, translated)) { authWarning = "[claude-english-buddy] Translation changed a literal; original prompt retained."; emitFallback(summaryCtx); return; }
    logCorrection({ mode: "translate", session, original: detection.text, corrected: translated, annotations: sourceLang });

    let ctx = `Translated prompt: ${translated}`;
    if (summaryCtx) ctx += " " + summaryCtx;
    const label = sourceLang ? `Translated ${sourceLang}: ${translated}` : `Translated: ${translated}`;
    emit({ additionalContext: ctx, systemMessage: label });
    return;
  }

  // mode === "correct"
  const domainTerms = config.domain_terms.length > 0
    ? `\nAdditional domain terms to preserve unchanged: ${config.domain_terms.join(", ")}`
    : "";
  const system = SYSTEM_CORRECT + domainTerms;

  const result = callHaiku(system, detection.text);
  if (!result) {
    emitFallback(summaryCtx);
    return;
  }

  if (result === "CLEAN") {
    logClean({ session });
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  const rawLines = result.split("\n");
  const corrected = (rawLines[0] || result).trim();
  if (!preservesLiterals(detection.text, corrected)) { authWarning = "[claude-english-buddy] Correction changed a literal; original prompt retained."; emitFallback(summaryCtx); return; }
  const annotationBlock = rawLines.slice(1).join("\n").trim();

  // Parse Haiku's output through the shared parser so we get defensive
  // no-op suppression and tolerate format drift (stray bullets, missing
  // categories, accidental legacy `>` syntax).
  const parsed = parseAnnotations(annotationBlock);
  const annotations = formatAnnotationsForStorage(parsed);

  // If the model emitted zero real corrections (everything was a no-op),
  // treat the prompt as clean rather than logging a misleading entry.
  if (parsed.length === 0) {
    logClean({ session });
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  logCorrection({ mode: "correct", session, original: detection.text, corrected, annotations });

  let ctx = `Corrected prompt: ${corrected}`;
  if (summaryCtx) ctx += " " + summaryCtx;
  const display = formatAnnotationsForDisplay(parsed);
  // Prefix the systemMessage so it reads naturally after Claude Code's
  // "UserPromptSubmit says:" wrapper. Without the label the reader can't
  // tell that the text below is the *interpreted* version of what they
  // typed — it looks like a raw echo. "User intends to say:" mirrors the
  // attribution-friendly framing the plugin uses elsewhere.
  const msg = display
    ? `User intends to say: ${corrected}\n${display}`
    : `User intends to say: ${corrected}`;
  emit({ additionalContext: ctx, systemMessage: msg });
}

main();

if (timing && process.env.CLAUDE_PLUGIN_DATA) {
  try {
    fs.mkdirSync(process.env.CLAUDE_PLUGIN_DATA, { recursive: true });
    fs.appendFileSync(path.join(process.env.CLAUDE_PLUGIN_DATA, 'coaching-metrics.jsonl'), JSON.stringify({ ts: new Date().toISOString(), elapsed_ms: Date.now() - timing.started, enabled: policy.enabled, timeout_seconds: policy.timeout, failure: Boolean(hadFailure || authWarning || policy.error) }) + '\n');
  } catch { /* telemetry cannot block the prompt */ }
}
