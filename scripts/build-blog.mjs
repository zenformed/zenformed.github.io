import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";
import { resolveBlogApp } from "./blog-apps.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "blog", "posts");
const BLOG_OUT_DIR = path.join(ROOT, "blog");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const SITE_ORIGIN = "https://zenformed.com";

marked.setOptions({
  gfm: true,
  breaks: false,
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

async function readTemplate(name) {
  return fs.readFile(path.join(TEMPLATES_DIR, name), "utf8");
}

function formatDateDisplay(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return escapeHtml(dateValue);
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function normalizeDateIso(dateValue) {
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().slice(0, 10);
  }

  const str = String(dateValue).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const date = new Date(`${str}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return str;
  }
  return date.toISOString().slice(0, 10);
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return "";
  }
  const markup = tags
    .map((tag) => `<span class="blog-tag">${escapeHtml(tag)}</span>`)
    .join("");
  return `<div class="blog-card-tags blog-article-tags">${markup}</div>`;
}

function renderAppIcon(app, { linked = true } = {}) {
  if (!app) {
    return "";
  }

  const icon = `<img src="${escapeHtml(app.icon)}" alt="" class="blog-app-icon" width="32" height="32" loading="lazy" />`;

  if (linked && app.productUrl) {
    return `<a href="${escapeHtml(app.productUrl)}" class="blog-app-icon-link" aria-label="${escapeHtml(app.name)}">${icon}</a>`;
  }

  return `<span class="blog-app-icon-wrap" aria-hidden="true">${icon}</span>`;
}

function deriveSlug(fileName, data) {
  if (data.slug) {
    return String(data.slug).trim();
  }
  return path.basename(fileName, path.extname(fileName));
}

function validatePost(data, fileName) {
  const required = ["title", "description", "date"];
  const missing = required.filter((key) => !data[key]);
  if (missing.length > 0) {
    throw new Error(
      `${fileName} is missing required frontmatter: ${missing.join(", ")}`,
    );
  }
}

function isDraftPost(data) {
  return data.draft === true || String(data.draft).toLowerCase() === "true";
}

async function loadPosts() {
  let entries;
  try {
    entries = await fs.readdir(POSTS_DIR);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const posts = [];
  let draftCount = 0;

  for (const entry of entries) {
    if (!entry.endsWith(".md")) {
      continue;
    }

    const filePath = path.join(POSTS_DIR, entry);
    const source = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(source);

    if (isDraftPost(data)) {
      draftCount += 1;
      continue;
    }

    validatePost(data, entry);

    const slug = deriveSlug(entry, data);
    const dateIso = normalizeDateIso(data.date);
    const app = resolveBlogApp(data.app, entry);

    posts.push({
      slug,
      title: String(data.title).trim(),
      description: String(data.description).trim(),
      date: dateIso,
      dateDisplay: formatDateDisplay(dateIso),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      app,
      appIconHtml: renderAppIcon(app),
      appCardIconHtml: renderAppIcon(app, { linked: false }),
      html: marked.parse(content),
      sourceFile: entry,
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  const slugs = posts.map((post) => post.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate blog slugs found: ${[...new Set(duplicates)].join(", ")}`);
  }

  if (draftCount > 0) {
    console.log(`Skipped ${draftCount} draft post(s).`);
  }

  return posts;
}

function renderPostListItem(post) {
  const postUrl = `/blog/${post.slug}/`;
  const tags = renderTags(post.tags);
  const titleRow = post.appCardIconHtml
    ? `<div class="blog-card-heading">${post.appCardIconHtml}<h2 class="blog-card-title">${escapeHtml(post.title)}</h2></div>`
    : `<h2 class="blog-card-title">${escapeHtml(post.title)}</h2>`;

  return `<a class="blog-card" href="${postUrl}">
  ${titleRow}
  <p class="blog-card-description">${escapeHtml(post.description)}</p>
  <div class="blog-card-meta">
    <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.dateDisplay)}</time>
    ${tags}
  </div>
  <span class="blog-card-read-more">Read more →</span>
</a>`;
}

function splitNavbar(navbarHtml) {
  const marker = "<!-- Mobile Dropdown Menu -->";
  const index = navbarHtml.indexOf(marker);
  if (index === -1) {
    return { bar: navbarHtml.trim(), mobile: "" };
  }
  return {
    bar: navbarHtml.slice(0, index).trim(),
    mobile: navbarHtml.slice(index).trim(),
  };
}

async function renderPage({
  pageTitle,
  metaDescription,
  canonicalUrl,
  ogType,
  body,
  navbarBar,
  navbarMobile,
  layoutTemplate,
}) {
  return renderTemplate(layoutTemplate, {
    PAGE_TITLE: escapeHtml(pageTitle),
    META_DESCRIPTION: escapeHtml(metaDescription),
    CANONICAL_URL: escapeHtml(canonicalUrl),
    OG_TYPE: escapeHtml(ogType),
    OG_TITLE: escapeHtml(pageTitle),
    OG_DESCRIPTION: escapeHtml(metaDescription),
    NAVBAR_BAR: navbarBar,
    NAVBAR_MOBILE: navbarMobile,
    BODY: body,
  });
}

async function writeHtml(filePath, html) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, "utf8");
}

async function cleanGeneratedPosts(posts) {
  let existing;
  try {
    existing = await fs.readdir(BLOG_OUT_DIR, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  const activeSlugs = new Set(posts.map((post) => post.slug));

  await Promise.all(
    existing
      .filter((entry) => entry.isDirectory() && entry.name !== "posts")
      .map(async (entry) => {
        if (!activeSlugs.has(entry.name)) {
          await fs.rm(path.join(BLOG_OUT_DIR, entry.name), {
            recursive: true,
            force: true,
          });
        }
      }),
  );
}

function buildSitemap(posts) {
  const urls = [
    {
      loc: `${SITE_ORIGIN}/`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: `${SITE_ORIGIN}/blog/`,
      lastmod: posts[0]?.date ?? new Date().toISOString().slice(0, 10),
      changefreq: "weekly",
      priority: "0.9",
    },
    ...posts.map((post) => ({
      loc: `${SITE_ORIGIN}/blog/${post.slug}/`,
      lastmod: post.date,
      changefreq: "monthly",
      priority: "0.8",
    })),
  ];

  const body = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function buildBlog() {
  const [layoutTemplate, indexTemplate, postTemplate, navbar] = await Promise.all([
    readTemplate("layout.html"),
    readTemplate("blog-index.html"),
    readTemplate("blog-post.html"),
    fs.readFile(path.join(ROOT, "sections", "navbar.html"), "utf8"),
  ]);

  const posts = await loadPosts();
  await cleanGeneratedPosts(posts);

  const { bar: navbarBar, mobile: navbarMobile } = splitNavbar(navbar);

  const postList =
    posts.length > 0
      ? posts.map(renderPostListItem).join("\n")
      : `<p class="blog-page-lead">No posts yet. Check back soon.</p>`;

  const indexBody = renderTemplate(indexTemplate, {
    POST_LIST: postList,
  });

  const indexHtml = await renderPage({
    pageTitle: "Blog — Zenformed",
    metaDescription:
      "Practical guides on business systems, automation, and software built for how you actually work.",
    canonicalUrl: `${SITE_ORIGIN}/blog/`,
    ogType: "website",
    body: indexBody,
    navbarBar,
    navbarMobile,
    layoutTemplate,
  });

  await writeHtml(path.join(BLOG_OUT_DIR, "index.html"), indexHtml);

  for (const post of posts) {
    const postBody = renderTemplate(postTemplate, {
      TITLE: escapeHtml(post.title),
      DESCRIPTION: escapeHtml(post.description),
      DATE_ISO: escapeHtml(post.date),
      DATE_DISPLAY: escapeHtml(post.dateDisplay),
      TAGS: renderTags(post.tags),
      TITLE_ROW: post.appIconHtml
        ? `<div class="blog-article-title-row">${post.appIconHtml}<h1 class="blog-article-title">${escapeHtml(post.title)}</h1></div>`
        : `<h1 class="blog-article-title">${escapeHtml(post.title)}</h1>`,
      CONTENT: post.html,
    });

    const postHtml = await renderPage({
      pageTitle: `${post.title} — Zenformed`,
      metaDescription: post.description,
      canonicalUrl: `${SITE_ORIGIN}/blog/${post.slug}/`,
      ogType: "article",
      body: postBody,
      navbarBar,
      navbarMobile,
      layoutTemplate,
    });

    await writeHtml(path.join(BLOG_OUT_DIR, post.slug, "index.html"), postHtml);
  }

  const sitemap = buildSitemap(posts);
  await fs.writeFile(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");

  console.log(`Built blog index and ${posts.length} post(s).`);
  for (const post of posts) {
    console.log(`  → /blog/${post.slug}/`);
  }
  console.log("Updated sitemap.xml");
}

buildBlog().catch((error) => {
  console.error(error);
  process.exit(1);
});
