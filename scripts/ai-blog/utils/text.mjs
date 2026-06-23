/**
 * @param {string} markdown
 */
export function countWords(markdown) {
  return markdown
    .replace(/[#>*_`[\]()\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * @param {string} text
 */
export function stripMarkdownFences(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }
  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

/**
 * @param {number} ms
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
