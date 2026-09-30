// Language detection — determines whether text is English, non-English, or mixed.
// Uses ASCII ratio heuristic: CJK/Cyrillic/Arabic characters are multi-byte
// but fall outside ASCII printable range (0x20-0x7E).

export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return { language: "unknown", mode: "skip", ratio: 0 };
  }

  const chars = [...text];
  const totalChars = chars.length;
  if (totalChars === 0) {
    return { language: "unknown", mode: "skip", ratio: 0 };
  }

  let asciiCount = 0;
  for (const ch of chars) {
    const code = ch.charCodeAt(0);
    if (code >= 0x20 && code <= 0x7e) asciiCount++;
  }

  const ratio = Math.round((asciiCount / totalChars) * 100);

  if (ratio >= 85) {
    return { language: "english", mode: "correct", ratio };
  }
  return { language: "non-english", mode: "translate", ratio };
}

export function shouldSkip(prompt) {
  if (!prompt || prompt.trim().length === 0) return true;
  // Slash commands (Claude Code) and $skill invocations (Codex) are commands, not prose.
  if (prompt.startsWith("/") || prompt.startsWith("$")) return true;

  // Too short — use both char and word count (CJK has no spaces)
  const charCount = [...prompt].length;
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  if (charCount < 10 && wordCount < 3) return true;

  // Code/URL patterns
  if (/^(https?:|git@|ssh:\/\/|\{|\[|\(|npm |pip |cargo |brew |sudo |cd |ls |cat |grep |find |docker |kubectl )/i.test(prompt)) {
    return true;
  }

  return false;
}

export function detectMode(prompt) {
  if (prompt.startsWith("::")) {
    const text = prompt.slice(2).trimStart();
    return { mode: "refine", text };
  }

  if (shouldSkip(prompt)) {
    return { mode: "skip", text: prompt };
  }

  const detection = detectLanguage(prompt);
  return { mode: detection.mode, text: prompt, ...detection };
}
