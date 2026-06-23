import fs from "node:fs/promises";
import path from "node:path";
import { POSTS_DIR } from "../config.mjs";
import { serializePost } from "./frontmatter.mjs";

/** @typedef {import("../providers/types.mjs").GeneratedArticle} GeneratedArticle */

/**
 * @param {string} slug
 */
async function postFileExists(slug) {
  try {
    await fs.access(path.join(POSTS_DIR, `${slug}.md`));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {GeneratedArticle} article
 * @param {object} [options]
 * @param {boolean} [options.overwrite]
 */
export async function writeGeneratedPost(article, options = {}) {
  const { overwrite = false } = options;
  const fileName = `${article.metadata.slug}.md`;
  const filePath = path.join(POSTS_DIR, fileName);
  const exists = await postFileExists(article.metadata.slug);

  if (exists && !overwrite) {
    throw new Error(
      `Post already exists: ${filePath}. Use --overwrite to replace it, or delete the file first.`,
    );
  }

  await fs.mkdir(POSTS_DIR, { recursive: true });
  const contents = serializePost(article.metadata, article.body);
  await fs.writeFile(filePath, contents, "utf8");
  return filePath;
}
