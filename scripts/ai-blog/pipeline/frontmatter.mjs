import matter from "gray-matter";

/** @typedef {import("../providers/types.mjs").ArticleMetadata} ArticleMetadata */

/**
 * @param {ArticleMetadata} metadata
 * @param {string} body
 */
export function serializePost(metadata, body) {
  return matter.stringify(body.trim() + "\n", {
    title: metadata.title,
    description: metadata.description,
    slug: metadata.slug,
    date: metadata.date,
    tags: metadata.tags,
    app: metadata.app,
    relatedProducts: metadata.relatedProducts,
    draft: metadata.draft,
  });
}
