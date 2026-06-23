import { GENERATION_DEFAULTS } from "../config.mjs";

const DEFAULT_OPENAI_BLOG_MODEL = "gpt-4o-mini";

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim() || "";
  const model = process.env.OPENAI_BLOG_MODEL?.trim() || DEFAULT_OPENAI_BLOG_MODEL;

  return {
    apiKey,
    model,
    minWords: GENERATION_DEFAULTS.minWords,
    targetWords: GENERATION_DEFAULTS.targetWords,
    batchDelayMs: Number.parseInt(process.env.OPENAI_BLOG_BATCH_DELAY_MS ?? "2000", 10),
  };
}

export function getDefaultOpenAIModel() {
  return DEFAULT_OPENAI_BLOG_MODEL;
}
