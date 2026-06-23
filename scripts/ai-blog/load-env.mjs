import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { getOpenAIConfig } from "./config/openai.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

/**
 * Load local env files for development.
 * Precedence (highest to lowest): shell → .env.local → .env
 */
export function loadLocalEnv() {
  const shellEnv = { ...process.env };

  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath, override: false });
    if (result.error) {
      throw new Error(`Failed to load .env: ${result.error.message}`);
    }
  }

  const localPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(localPath)) {
    const parsed = dotenv.parse(fs.readFileSync(localPath));
    for (const [key, value] of Object.entries(parsed)) {
      if (!(key in shellEnv)) {
        process.env[key] = value;
      }
    }
  }
}

export function printStartupDiagnostics({ provider }) {
  const { apiKey, model } = getOpenAIConfig();
  const keyDetected = Boolean(apiKey);

  console.log(`OpenAI key detected: ${keyDetected ? "yes" : "no"}`);
  console.log(`Selected model: ${model}`);

  if (provider === "openai" && !keyDetected) {
    console.log(
      "Hint: set OPENAI_API_KEY in .env.local or export it in your shell before running.",
    );
  }
}

// Load immediately when this module is imported (must be first import in cli.mjs).
loadLocalEnv();
