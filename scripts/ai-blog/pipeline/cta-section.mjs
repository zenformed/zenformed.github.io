import { GENERATION_DEFAULTS } from "../config.mjs";
import { buildProductCtaHtml, findCtaStart, LEGACY_CTA_HEADING } from "../../blog-cta.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */

/**
 * @param {BlogTopic} topic
 * @param {string} [appKey]
 */
export function buildCtaSection(topic, appKey = GENERATION_DEFAULTS.app) {
  return buildProductCtaHtml({
    appKey,
    topicLabel: topic.label,
  });
}

/**
 * @param {string} body
 */
export function stripExistingCta(body) {
  const index = findCtaStart(body);

  if (index === -1) {
    return body.trim();
  }

  return body.slice(0, index).trim();
}

export { findCtaStart, LEGACY_CTA_HEADING };
