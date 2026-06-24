import { AUDIENCE } from "../config.mjs";
import { getTopicKeyword } from "../topics.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */

/**
 * @param {BlogTopic} topic
 */
export function buildMetadataPrompt(topic) {
  const keyword = getTopicKeyword(topic);

  return [
    "You are writing SEO metadata for a Zenformed blog article.",
    `Product context: ${AUDIENCE.product} (educational article, not a sales page).`,
    `Audience: ${AUDIENCE.industries.join(", ")}.`,
    `Topic: ${topic.label}.`,
    `Topic summary: ${topic.summary}.`,
    `Primary SEO keyword phrase: ${keyword}`,
    "",
    "Return JSON with: title, description, slug, tags (array of 3-6 lowercase strings).",
    `- Title: specific, under 70 characters, must include the keyword phrase or its core terms.`,
    "- Description: 140-160 characters, useful and concrete.",
    "- Slug: lowercase kebab-case, SEO-friendly, no dates.",
    '- Include tag "buildcore".',
    `Related angles: ${topic.angles.join(", ")}.`,
  ].join("\n");
}
