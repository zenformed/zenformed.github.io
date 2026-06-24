import { GENERATION_DEFAULTS } from "../config.mjs";
import { buildArticlePrompt, buildMetadataPrompt } from "../prompts/index.mjs";
import { finalizeArticle } from "../pipeline/finalize-article.mjs";
import { getTopicKeyword } from "../topics.mjs";
import { ArticleGenerator } from "./types.mjs";
import { buildMockArticleBody } from "./mock-body.mjs";
import { slugify, ensureUniqueSlug } from "../pipeline/slug.mjs";
import { todayIsoDate } from "../pipeline/dates.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */
/** @typedef {import("./types.mjs").GenerateArticleInput} GenerateArticleInput */

export class MockArticleGenerator extends ArticleGenerator {
  /** @param {GenerateArticleInput} input */
  async generate(input) {
    const { topic, reservedSlugs = new Set() } = input;
    const metadataPrompt = buildMetadataPrompt(topic);
    const metadata = await this.#generateMetadata(topic, reservedSlugs);
    const articlePrompt = buildArticlePrompt(topic, metadata);
    const rawBody = buildMockArticleBody(topic, metadata);
    const { body, wordCount } = finalizeArticle({
      body: rawBody,
      topic,
      metadata,
    });

    return {
      topic,
      metadata,
      body,
      metadataPrompt,
      articlePrompt,
      wordCount,
    };
  }

  async #generateMetadata(topic, reservedSlugs) {
    const keyword = getTopicKeyword(topic);
    const title = `${topic.label} for Contractors: A Practical ${keyword} Playbook`;
    const description = `How construction teams improve ${keyword} with clearer handoffs, accountability, and project records that match field reality.`;
    const baseSlug = slugify(topic.slugHint || title);
    const slug = await ensureUniqueSlug(baseSlug, reservedSlugs);

    return {
      title,
      description,
      slug,
      date: todayIsoDate(),
      tags: [...new Set([...topic.tags, "construction", "buildcore"])],
      app: GENERATION_DEFAULTS.app,
      relatedProducts: [GENERATION_DEFAULTS.app],
      draft: GENERATION_DEFAULTS.draft,
    };
  }
}
