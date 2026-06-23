import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, "../..");
export const POSTS_DIR = path.join(ROOT, "content", "blog", "posts");

export const GENERATION_DEFAULTS = {
  app: "buildcore",
  draft: true,
  provider: "mock",
  minWords: 1500,
  targetWords: 2000,
};

export const AUDIENCE = {
  product: "BuildCore",
  industries: ["construction businesses", "contractors", "project managers"],
};
