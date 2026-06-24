import { AUDIENCE, GENERATION_DEFAULTS } from "../config.mjs";
import { getTopicKeyword } from "../topics.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */
/** @typedef {import("../providers/types.mjs").ArticleMetadata} ArticleMetadata */

export const FORBIDDEN_PHRASES = [
  "in today's fast-paced world",
  "in conclusion",
  "revolutionize your business",
  "game-changer",
  "look no further",
  "at the end of the day",
  "it goes without saying",
  "leverage synergies",
];

export const BUILDCORE_MENTION_MIN = 3;
export const BUILDCORE_MENTION_MAX = 6;
export const BUILDCORE_MENTION_TARGET = "3-5";

export const BUILDCORE_CAPABILITIES = [
  "workflow tasks",
  "approvals",
  "accountability",
  "project documentation",
  "reminders",
  "reporting",
  "project tracking",
];

/**
 * @param {BlogTopic} topic
 * @param {ArticleMetadata} metadata
 */
export function buildArticlePrompt(topic, metadata) {
  const keyword = getTopicKeyword(topic);

  return [
    "You are an expert construction operations writer for Zenformed.",
    "Teach first. Sell second. This is an educational article, not a sales page.",
    `Audience: ${AUDIENCE.industries.join(", ")}.`,
    `Title: ${metadata.title}`,
    `Primary SEO keyword phrase: ${keyword}`,
    `Topic: ${topic.label} — ${topic.summary}`,
    `Target length: ${GENERATION_DEFAULTS.minWords}-${GENERATION_DEFAULTS.targetWords}+ words (before the CTA section).`,
    "",
    "BuildCore integration:",
    `- Mention BuildCore exactly ${BUILDCORE_MENTION_TARGET} times before the CTA.`,
    "- Spread mentions across the introduction, middle sections, and near the end.",
    "- Do not mention BuildCore in every section.",
    "- Do not cluster all BuildCore mentions in one section.",
    "- Do not write a sales pitch or product brochure.",
    "- Use BuildCore as an example implementation when it fits the workflow being taught.",
    `- Reference relevant capabilities when useful: ${BUILDCORE_CAPABILITIES.join(", ")}.`,
    '- When the context is already clear, use "the platform", "the system", "your CRM", or no product mention instead of repeating BuildCore.',
    '- Example phrasing: "a system like BuildCore can...", "teams using BuildCore often...", "the platform can route approvals..."',
    "- The reader should finish thinking: I need a process like this — and BuildCore seems designed for it.",
    "",
    "SEO requirements:",
    `- Include the keyword phrase "${keyword}" in the introduction.`,
    `- Include the keyword phrase in at least one H2 heading.`,
    `- Include the keyword phrase in the final section before the CTA.`,
    "- Do not keyword stuff.",
    "",
    "Structure and quality:",
    "- Use markdown only. No YAML frontmatter.",
    "- Include at least 5 H2 sections of substantive content.",
    "- Include practical field-and-office scenarios, checklists, and workflows.",
    "- Prefer project management examples over abstract advice.",
    "- Do NOT include the final CTA section — it is appended automatically after generation.",
    "",
    "Avoid:",
    ...FORBIDDEN_PHRASES.map((phrase) => `- "${phrase}"`),
    "- generic filler and obvious AI phrasing",
    "- fake statistics, surveys, or customer stories",
    "- repeated product advertising",
    "",
    `Angles to cover: ${topic.angles.join(", ")}.`,
  ].join("\n");
}

/**
 * @param {string} body
 * @param {number} mentionCount
 */
export function buildBuildCoreRevisionPrompt(body, mentionCount) {
  return [
    `The article below mentions BuildCore ${mentionCount} times before the CTA.`,
    `Reduce BuildCore mentions to ${BUILDCORE_MENTION_TARGET} before the CTA while preserving meaning, structure, and word count.`,
    "Do not mention BuildCore in every section.",
    'Replace extra mentions with phrases like "the platform", "the system", "your CRM", or remove the product reference when the context is already clear.',
    "Keep at least 3 BuildCore mentions.",
    "Do not include the CTA section.",
    "Return the full revised article in Markdown only.",
    "",
    "Article:",
    body,
  ].join("\n");
}
