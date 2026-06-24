/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */

/**
 * @typedef {object} ArticleMetadata
 * @property {string} title
 * @property {string} description
 * @property {string} slug
 * @property {string} date
 * @property {string} [publishDate]
 * @property {string[]} tags
 * @property {string} app
 * @property {string[]} relatedProducts
 * @property {boolean} draft
 */

/**
 * @typedef {object} GeneratedArticle
 * @property {ArticleMetadata} metadata
 * @property {string} body
 * @property {BlogTopic} topic
 * @property {string} metadataPrompt
 * @property {string} articlePrompt
 * @property {number} wordCount
 */

/**
 * @typedef {object} GenerateArticleInput
 * @property {BlogTopic} topic
 * @property {Set<string>} [reservedSlugs]
 * @property {boolean} [overwrite]
 */

export class ArticleGenerator {
  /** @param {GenerateArticleInput} _input */
  async generate(_input) {
    throw new Error("ArticleGenerator.generate() is not implemented.");
  }
}
