import path from "node:path";
import { GENERATION_DEFAULTS } from "../../config.mjs";
import { slugify, ensureUniqueSlug } from "../../pipeline/slug.mjs";
import { POSTS_DIR } from "../../config.mjs";
import fs from "node:fs/promises";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param {string} slug
 */
export async function postFileExists(slug) {
  try {
    await fs.access(path.join(POSTS_DIR, `${slug}.md`));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {unknown} raw
 * @param {object} context
 * @param {Set<string>} context.reservedSlugs
 * @param {boolean} [context.overwrite]
 */
export async function validateAndBuildMetadata(raw, { reservedSlugs, overwrite = false }) {
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!data || typeof data !== "object") {
    throw new Error("Metadata must be a JSON object.");
  }

  const title = String(data.title ?? "").trim();
  const description = String(data.description ?? "").trim();
  const slug = slugify(String(data.slug ?? "").trim());
  const tags = data.tags;

  if (!title) {
    throw new Error("Metadata validation failed: title is required.");
  }

  if (title.length > 100) {
    throw new Error("Metadata validation failed: title is too long.");
  }

  if (!description) {
    throw new Error("Metadata validation failed: description is required.");
  }

  if (description.length < 80 || description.length > 220) {
    throw new Error(
      "Metadata validation failed: description should be roughly 140-160 characters (80-220 allowed).",
    );
  }

  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new Error("Metadata validation failed: slug must be lowercase kebab-case.");
  }

  if (!Array.isArray(tags) || tags.length < 2) {
    throw new Error("Metadata validation failed: tags must be an array with at least 2 items.");
  }

  const normalizedTags = tags
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean);

  if (!normalizedTags.includes("buildcore")) {
    normalizedTags.unshift("buildcore");
  }

  const existsOnDisk = await postFileExists(slug);

  if (existsOnDisk && !overwrite) {
    throw new Error(
      `Metadata validation failed: slug "${slug}" already exists. Use --overwrite to replace it.`,
    );
  }

  let finalSlug = slug;

  if (!overwrite) {
    finalSlug = await ensureUniqueSlug(slug, reservedSlugs);
  } else {
    reservedSlugs.add(slug);
  }

  return {
    title,
    description,
    slug: finalSlug,
    date: new Date().toISOString().slice(0, 10),
    tags: [...new Set(normalizedTags)],
    app: GENERATION_DEFAULTS.app,
    relatedProducts: [GENERATION_DEFAULTS.app],
    draft: GENERATION_DEFAULTS.draft,
  };
}
