import fs from "node:fs/promises";
import path from "node:path";
import { POSTS_DIR } from "../config.mjs";

/**
 * @param {string} text
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * @param {string} baseSlug
 * @param {Set<string>} reservedSlugs
 */
export async function ensureUniqueSlug(baseSlug, reservedSlugs) {
  let slug = baseSlug || "article";
  let suffix = 2;

  while (reservedSlugs.has(slug) || (await postFileExists(slug))) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  reservedSlugs.add(slug);
  return slug;
}

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
 * @returns {Promise<Set<string>>}
 */
export async function loadExistingSlugs() {
  const slugs = new Set();

  let entries;
  try {
    entries = await fs.readdir(POSTS_DIR);
  } catch {
    return slugs;
  }

  for (const entry of entries) {
    if (entry.endsWith(".md")) {
      slugs.add(entry.replace(/\.md$/, ""));
    }
  }

  return slugs;
}
