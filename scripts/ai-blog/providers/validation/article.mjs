import { GENERATION_DEFAULTS } from "../../config.mjs";
import { getTopicKeyword } from "../../topics.mjs";
import {
  BUILDCORE_MENTION_MIN,
  BUILDCORE_MENTION_MAX,
  BUILDCORE_MENTION_TARGET,
  FORBIDDEN_PHRASES,
} from "../../prompts/article.mjs";
import { countWords } from "../../utils/text.mjs";
import { buildCtaSection, stripExistingCta } from "../../pipeline/cta-section.mjs";
import { findCtaStart } from "../../../blog-cta.mjs";

/** @typedef {import("../../topics.mjs").BlogTopic} BlogTopic */
/** @typedef {import("../types.mjs").ArticleMetadata} ArticleMetadata */

const FRONTMATTER_PATTERN = /^---\s*\n[\s\S]*?\n---\s*\n/;
const MIN_H2_SECTIONS = 5;
const MIN_WORD_COUNT = 1501;

const FORBIDDEN_PATTERNS = [
  { pattern: /^---\s*$/m, message: "body must not include YAML frontmatter" },
  { pattern: /testimonial/i, message: "body must not include testimonials" },
  { pattern: /★{3,}/, message: "body must not include star-rating style testimonials" },
  { pattern: /our client said/i, message: "body must not include fake client quotes" },
  { pattern: /"[^"]{8,}" said/i, message: "body must not include attributed quotes presented as testimonials" },
  { pattern: /starting at \$/i, message: "body must not include pricing claims" },
  { pattern: /\$\d+(?:\.\d{2})?\s*(?:\/|per)\s*month/i, message: "body must not include monthly pricing claims" },
  { pattern: /free trial/i, message: "body must not include free trial claims" },
  { pattern: /pricing plan/i, message: "body must not include pricing plan claims" },
  { pattern: /\b\d{1,3}%\s+of\s+(?:contractors|companies|businesses)\b/i, message: "body must not include fake statistics" },
  { pattern: /\b(?:studies show|research shows|survey found)\b/i, message: "body must not include unsupported research claims" },
];

/**
 * @param {string} keyword
 * @param {string} text
 */
export function keywordMatchesText(keyword, text) {
  const haystack = text.toLowerCase();
  const needle = keyword.toLowerCase();

  if (haystack.includes(needle)) {
    return true;
  }

  const tokens = needle.split(/\s+/).filter((token) => token.length > 3);
  if (tokens.length === 0) {
    return false;
  }

  const matched = tokens.filter((token) => haystack.includes(token)).length;
  return matched >= Math.ceil(tokens.length * 0.6);
}

/**
 * @param {string} body
 */
export function countBuildCoreMentions(body) {
  return (body.match(/\bBuildCore\b/gi) ?? []).length;
}

/**
 * @param {string} body
 */
export function countH2Sections(body) {
  return (body.match(/^##\s+/gm) ?? []).length;
}

/**
 * @param {string} body
 */
export function getIntroduction(body) {
  const parts = body.split(/\n\s*\n/);
  return parts.slice(0, 2).join("\n\n");
}

/**
 * @param {string} body
 */
export function getPreCtaBody(body) {
  const index = findCtaStart(body);
  return index === -1 ? body : body.slice(0, index).trim();
}

/**
 * @param {string} body
 */
export function getConclusionSection(body) {
  const preCta = getPreCtaBody(body);
  const sections = preCta.split(/^##\s+/m);
  return sections[sections.length - 1] ?? preCta;
}

/**
 * @param {BlogTopic} topic
 */
export function appendCtaToArticle(body, topic) {
  const articleBody = stripExistingCta(body);
  return `${articleBody}\n\n${buildCtaSection(topic)}\n`;
}

/**
 * @param {string} body
 * @param {object} context
 * @param {BlogTopic} context.topic
 * @param {ArticleMetadata} context.metadata
 */
export function validateArticleBody(body, { topic, metadata }) {
  const trimmed = String(body ?? "").trim();
  const errors = [];
  const keyword = getTopicKeyword(topic);
  const preCtaBody = getPreCtaBody(trimmed);

  if (!trimmed) {
    throw new Error("Article validation failed: body is empty.");
  }

  if (FRONTMATTER_PATTERN.test(trimmed) || trimmed.startsWith("---")) {
    throw new Error("Article validation failed: body must not include frontmatter.");
  }

  if (findCtaStart(trimmed) === -1) {
    errors.push("article must include the required product CTA section");
  }

  const wordCount = countWords(trimmed);
  if (wordCount < MIN_WORD_COUNT) {
    errors.push(`word count must be greater than 1500 (got ${wordCount})`);
  }

  const h2Count = countH2Sections(preCtaBody);
  if (h2Count < MIN_H2_SECTIONS) {
    errors.push(`article must contain at least ${MIN_H2_SECTIONS} H2 sections before the CTA (got ${h2Count})`);
  }

  const buildCoreMentions = countBuildCoreMentions(preCtaBody);
  if (buildCoreMentions < BUILDCORE_MENTION_MIN) {
    errors.push(
      `article must mention BuildCore at least ${BUILDCORE_MENTION_MIN} times before the CTA (got ${buildCoreMentions})`,
    );
  }

  if (buildCoreMentions > BUILDCORE_MENTION_MAX) {
    errors.push(
      `article mentions BuildCore too often before the CTA (${buildCoreMentions}); reduce to ${BUILDCORE_MENTION_TARGET}`,
    );
  }

  if (!keywordMatchesText(keyword, metadata.title)) {
    errors.push(`title must include the primary keyword phrase "${keyword}" or its core terms`);
  }

  if (!keywordMatchesText(keyword, getIntroduction(preCtaBody))) {
    errors.push(`introduction must include the primary keyword phrase "${keyword}"`);
  }

  const h2Headings = [...preCtaBody.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
  if (!h2Headings.some((heading) => keywordMatchesText(keyword, heading))) {
    errors.push(`at least one H2 heading must include the primary keyword phrase "${keyword}"`);
  }

  if (!keywordMatchesText(keyword, getConclusionSection(preCtaBody))) {
    errors.push(`conclusion section must include the primary keyword phrase "${keyword}"`);
  }

  for (const phrase of FORBIDDEN_PHRASES) {
    if (preCtaBody.toLowerCase().includes(phrase)) {
      errors.push(`article must not include forbidden phrase "${phrase}"`);
    }
  }

  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(preCtaBody)) {
      errors.push(rule.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Article validation failed:\n- ${errors.join("\n- ")}`);
  }

  return {
    body: trimmed,
    wordCount,
  };
}

/**
 * @param {string[]} errors
 */
export function isBuildCoreMentionOverflow(errors) {
  return (
    errors.length === 1 &&
    errors[0].includes("mentions BuildCore too often before the CTA")
  );
}

/**
 * @param {string[]} errors
 */
export function buildArticleRetryNote(errors) {
  return [
    "Your previous output failed validation.",
    ...errors.map((error) => `- ${error}`),
    "Rewrite the full article in Markdown only (no frontmatter).",
    `Target at least ${GENERATION_DEFAULTS.minWords} words before the CTA.`,
    `Mention BuildCore exactly ${BUILDCORE_MENTION_TARGET} times, spread across the article.`,
    "Teach first. Do not write a sales page.",
    "Include the keyword in the introduction, one H2, and the conclusion.",
    "Do not include the CTA section — it is appended automatically.",
    "Avoid testimonials, pricing claims, fake statistics, and generic AI filler.",
  ].join("\n");
}

/**
 * @param {Error} error
 */
export function getValidationErrors(error) {
  if (!(error instanceof Error)) {
    return [String(error)];
  }

  if (error.message.startsWith("Article validation failed:")) {
    return error.message
      .replace("Article validation failed:\n", "")
      .split("\n- ")
      .filter(Boolean);
  }

  return [error.message];
}
