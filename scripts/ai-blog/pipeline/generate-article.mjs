import { GENERATION_DEFAULTS } from "../config.mjs";
import { getOpenAIConfig } from "../config/openai.mjs";
import { createArticleGenerator } from "../providers/index.mjs";
import { resolveTopics } from "./topic-selector.mjs";
import { loadExistingSlugs } from "./slug.mjs";
import { writeGeneratedPost } from "./write-post.mjs";
import { sleep } from "../utils/text.mjs";

/**
 * @param {object} options
 * @param {number} options.count
 * @param {"mock" | "openai"} [options.provider]
 * @param {string} [options.topicId]
 * @param {boolean} [options.overwrite]
 */
export async function generateArticles({
  count,
  provider = GENERATION_DEFAULTS.provider,
  topicId,
  overwrite = false,
}) {
  const generator = createArticleGenerator(provider);
  const reservedSlugs = await loadExistingSlugs();
  const topics = resolveTopics(count, { topicId });
  const results = [];
  const batchDelayMs =
    provider === "openai" ? getOpenAIConfig().batchDelayMs : 0;

  for (let index = 0; index < topics.length; index += 1) {
    const topic = topics[index];

    if (index > 0) {
      console.log(`Waiting ${batchDelayMs}ms before next generation...`);
      await sleep(batchDelayMs);
    }

    console.log(
      `[${index + 1}/${topics.length}] Generating topic: ${topic.id} (${provider})`,
    );

    const article = await generator.generate({
      topic,
      reservedSlugs,
      overwrite,
    });

    const filePath = await writeGeneratedPost(article, { overwrite });

    results.push({
      filePath,
      slug: article.metadata.slug,
      title: article.metadata.title,
      wordCount: article.wordCount,
      draft: article.metadata.draft,
      topicId: topic.id,
    });

    console.log(
      `Generated draft: ${article.metadata.slug} (${article.wordCount} words) → ${filePath}`,
    );
  }

  return results;
}
