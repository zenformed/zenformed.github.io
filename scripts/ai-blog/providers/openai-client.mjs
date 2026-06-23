import OpenAI from "openai";
import { getOpenAIConfig } from "../config/openai.mjs";

let cachedClient = null;

export function getOpenAIClient() {
  const { apiKey } = getOpenAIConfig();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to your local environment or .env file (never commit the key).",
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

/**
 * @param {OpenAI} client
 * @param {object} options
 * @param {string} options.model
 * @param {string} options.system
 * @param {string} options.user
 * @param {boolean} [options.json]
 */
export async function createChatCompletion(client, { model, system, user, json = false }) {
  const params = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  };

  if (json) {
    params.response_format = { type: "json_object" };
  }

  const response = await client.chat.completions.create(params);
  const content = response.choices[0]?.message?.content;

  if (!content || !content.trim()) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content.trim();
}
