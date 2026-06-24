import { appendCtaToArticle, validateArticleBody } from "../providers/validation/article.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */
/** @typedef {import("../providers/types.mjs").ArticleMetadata} ArticleMetadata */

/**
 * @param {object} input
 * @param {string} input.body
 * @param {BlogTopic} input.topic
 * @param {ArticleMetadata} input.metadata
 */
export function finalizeArticle({ body, topic, metadata }) {
  const withCta = appendCtaToArticle(body, topic);
  return validateArticleBody(withCta, { topic, metadata });
}
