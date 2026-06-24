import { buildArticlePrompt, buildMetadataPrompt } from "../prompts/index.mjs";
import {
  BUILDCORE_MENTION_MAX,
  buildBuildCoreRevisionPrompt,
} from "../prompts/article.mjs";
import { getOpenAIConfig } from "../config/openai.mjs";
import { stripMarkdownFences } from "../utils/text.mjs";
import { finalizeArticle } from "../pipeline/finalize-article.mjs";
import { stripExistingCta } from "../pipeline/cta-section.mjs";
import { ArticleGenerator } from "./types.mjs";
import { createChatCompletion, getOpenAIClient } from "./openai-client.mjs";
import { validateAndBuildMetadata } from "./validation/metadata.mjs";
import {
  buildArticleRetryNote,
  countBuildCoreMentions,
  getValidationErrors,
  isBuildCoreMentionOverflow,
} from "./validation/article.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */
/** @typedef {import("./types.mjs").GenerateArticleInput} GenerateArticleInput */

const METADATA_SYSTEM = [
  "You are an SEO editor for Zenformed construction software content.",
  "Respond with valid JSON only.",
  "Do not use markdown code fences.",
  'Schema: {"title":"...","description":"...","slug":"...","tags":["..."]}',
].join(" ");

const ARTICLE_SYSTEM = [
  "You are a senior construction operations writer for Zenformed.",
  "Teach first. Sell second. Write practical educational content, not a sales page.",
  "Return Markdown article body only.",
  "Do not include YAML frontmatter.",
  "Do not include the final CTA section — it is appended automatically.",
  "Mention BuildCore exactly 3-5 times before the CTA, spread across the article.",
  'When context is clear, use "the platform", "the system", or "your CRM" instead of repeating BuildCore.',
  "Do not include testimonials, pricing, fake statistics, or fake customer stories.",
].join(" ");

const REVISION_SYSTEM = [
  "You are a senior editor for Zenformed construction content.",
  "Revise the article to reduce repetitive product naming while preserving meaning.",
  "Return Markdown article body only.",
  "Do not include YAML frontmatter or the CTA section.",
].join(" ");

export class OpenAIArticleGenerator extends ArticleGenerator {
  constructor() {
    super();
    const { model } = getOpenAIConfig();
    this.model = model;
    this.client = getOpenAIClient();
  }

  /** @param {GenerateArticleInput} input */
  async generate(input) {
    const { topic, reservedSlugs = new Set(), overwrite = false } = input;
    const metadataPrompt = buildMetadataPrompt(topic);

    const metadata = await this.#generateMetadata(topic, metadataPrompt, {
      reservedSlugs,
      overwrite,
    });

    const articlePrompt = buildArticlePrompt(topic, metadata);
    const { body: validatedBody, wordCount } = await this.#generateArticleBody(
      topic,
      metadata,
      articlePrompt,
    );

    return {
      topic,
      metadata,
      body: validatedBody,
      metadataPrompt,
      articlePrompt,
      wordCount,
    };
  }

  async #generateMetadata(topic, metadataPrompt, options) {
    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const retryNote =
          attempt === 0
            ? ""
            : `\n\nFix these validation errors from your previous JSON:\n${lastError}`;

        const raw = await createChatCompletion(this.client, {
          model: this.model,
          system: METADATA_SYSTEM,
          user: `${metadataPrompt}${retryNote}`,
          json: true,
        });

        const parsed = JSON.parse(stripMarkdownFences(raw));
        return await validateAndBuildMetadata(parsed, options);
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (attempt === 1) {
          throw new Error(`OpenAI metadata generation failed: ${lastError}`);
        }
      }
    }

    throw new Error("OpenAI metadata generation failed.");
  }

  async #generateArticleBody(topic, metadata, articlePrompt) {
    let validationErrors = [];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryNote =
        attempt === 0 || validationErrors.length === 0
          ? ""
          : `\n\n${buildArticleRetryNote(validationErrors)}`;

      const raw = await createChatCompletion(this.client, {
        model: this.model,
        system: ARTICLE_SYSTEM,
        user: `${articlePrompt}${retryNote}`,
        json: false,
      });

      let cleaned = stripExistingCta(stripMarkdownFences(raw));
      cleaned = await this.#maybeReviseBuildCoreMentions(cleaned);

      try {
        return finalizeArticle({ body: cleaned, topic, metadata });
      } catch (error) {
        validationErrors = getValidationErrors(error);

        if (isBuildCoreMentionOverflow(validationErrors)) {
          try {
            const revised = await this.#reviseBuildCoreMentions(cleaned);
            return finalizeArticle({ body: revised, topic, metadata });
          } catch (revisionError) {
            validationErrors = getValidationErrors(revisionError);
          }
        }

        if (attempt === 1) {
          throw new Error(`OpenAI article generation failed: ${validationErrors.join("; ")}`);
        }
      }
    }

    throw new Error("OpenAI article generation failed.");
  }

  /**
   * @param {string} body
   */
  async #maybeReviseBuildCoreMentions(body) {
    const mentions = countBuildCoreMentions(body);

    if (mentions <= BUILDCORE_MENTION_MAX) {
      return body;
    }

    console.log(
      `BuildCore mentions (${mentions}) exceed ${BUILDCORE_MENTION_MAX}. Running revision pass...`,
    );

    return this.#reviseBuildCoreMentions(body);
  }

  /**
   * @param {string} body
   */
  async #reviseBuildCoreMentions(body) {
    const mentions = countBuildCoreMentions(body);
    const revised = await createChatCompletion(this.client, {
      model: this.model,
      system: REVISION_SYSTEM,
      user: buildBuildCoreRevisionPrompt(body, mentions),
      json: false,
    });

    return stripExistingCta(stripMarkdownFences(revised));
  }
}
