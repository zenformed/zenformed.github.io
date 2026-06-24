import { MockArticleGenerator } from "./mock.mjs";
import { OpenAIArticleGenerator } from "./openai.mjs";

/** @param {"mock" | "openai"} [providerName] */
export function createArticleGenerator(providerName = "mock") {
  switch (providerName) {
    case "mock":
      return new MockArticleGenerator();
    case "openai":
      return new OpenAIArticleGenerator();
    default:
      throw new Error(`Unknown article generator provider: ${providerName}`);
  }
}

export { MockArticleGenerator } from "./mock.mjs";
export { OpenAIArticleGenerator } from "./openai.mjs";
export { ArticleGenerator } from "./types.mjs";
