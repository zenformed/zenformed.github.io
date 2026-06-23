import matter from "gray-matter";

/** @typedef {import("../providers/types.mjs").ArticleMetadata} ArticleMetadata */

/**
 * @param {ArticleMetadata} metadata
 * @param {string} body
 */
export function serializePost(metadata, body) {
  const frontmatter = {
    title: metadata.title,
    description: metadata.description,
    slug: metadata.slug,
    date: metadata.date,
    tags: metadata.tags,
    app: metadata.app,
    relatedProducts: metadata.relatedProducts,
    draft: metadata.draft,
  };

  if (metadata.publishDate) {
    frontmatter.publishDate = metadata.publishDate;
  }

  return matter.stringify(body.trim() + "\n", frontmatter);
}
