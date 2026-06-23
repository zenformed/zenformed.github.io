# AI Blog Article Generation

Local pipeline for generating draft blog markdown files compatible with the existing static blog build.

## Overview

```
npm run generate:blog
        ↓
scripts/ai-blog/cli.mjs
        ↓
topic selection → prompt builders → provider (mock | openai)
        ↓
content/blog/posts/{slug}.md   (draft: true)
        ↓
npm run build:blog             (drafts excluded from site output)
```

Generation is **manual** and **local**. Nothing runs during `build:blog`.

## Commands

### Mock provider (no API key)

```bash
npm run generate:blog
npm run generate:blog -- --count=3 --provider=mock
```

### OpenAI provider

Set your API key locally first (never commit it):

**Windows (PowerShell)**

```powershell
$env:OPENAI_API_KEY="sk-..."
npm run generate:blog -- --count=1 --provider=openai
```

**macOS / Linux**

```bash
export OPENAI_API_KEY="sk-..."
npm run generate:blog -- --count=1 --provider=openai
```

Generate a batch:

```bash
npm run generate:blog -- --count=3 --provider=openai
```

Target one topic:

```bash
npm run generate:blog -- --provider=openai --topic=customer-approval-workflows
```

Replace an existing post file:

```bash
npm run generate:blog -- --provider=openai --topic=change-orders --overwrite
```

## Environment variables

Copy `.env.example` to `.env.local` for local development (never commit `.env.local`):

```bash
cp .env.example .env.local
```

The CLI loads `.env` then `.env.local` automatically at startup. Shell-exported variables take precedence.

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (OpenAI provider) | Your OpenAI API key. **Never commit this.** |
| `OPENAI_BLOG_MODEL` | No | Model override. Default: `gpt-4o-mini`. Example: `gpt-5-mini` if enabled on your account. |
| `OPENAI_BLOG_BATCH_DELAY_MS` | No | Delay between batch generations. Default: `2000`. |

## CLI options

| Flag | Description |
|------|-------------|
| `--count=N` | Number of articles to generate (default: `1`, max `50`) |
| `--provider=mock\|openai` | Generator provider (default: `mock`) |
| `--topic=TOPIC_ID` | Generate for a specific topic from `topics.mjs` |
| `--overwrite` | Replace an existing `content/blog/posts/{slug}.md` file |
| `--help` | Show help and valid topic IDs |

Run `npm run generate:blog -- --help` to list all topic IDs.

## Output location

```
content/blog/posts/{slug}.md
```

Each file includes frontmatter compatible with `scripts/build-blog.mjs`:

```yaml
---
title:
description:
slug:
date:
tags:
app: buildcore
draft: true
---
```

**All generated posts remain `draft: true` by default.** Review before publishing.

## Draft workflow

- `npm run build:blog` **skips** draft posts (they do not appear on `/blog/` or in `sitemap.xml`)
- To publish: review the markdown, edit as needed, set `draft: false`, then run `npm run build:blog`
- Existing posts are **not overwritten** unless you pass `--overwrite`

## Architecture

```
scripts/ai-blog/
├── cli.mjs
├── config.mjs
├── config/openai.mjs         # model + env defaults
├── topics.mjs
├── utils/text.mjs
├── prompts/
│   ├── metadata.mjs
│   ├── article.mjs
│   └── index.mjs
├── providers/
│   ├── types.mjs
│   ├── mock.mjs
│   ├── mock-body.mjs
│   ├── openai.mjs            # OpenAI provider (Phase 2B)
│   ├── openai-client.mjs
│   ├── validation/
│   │   ├── metadata.mjs
│   │   └── article.mjs
│   └── index.mjs
└── pipeline/
    ├── topic-selector.mjs
    ├── slug.mjs
    ├── frontmatter.mjs
    ├── write-post.mjs
    ├── generate-article.mjs
    └── dates.mjs
```

### OpenAI provider flow

1. **Metadata step** — `buildMetadataPrompt(topic)` → OpenAI JSON response
2. **Validate metadata** — title, description, slug, tags; enforce `app: buildcore`, `relatedProducts: [buildcore]`, `draft: true`
3. **Article step** — `buildArticlePrompt(topic, metadata)` → OpenAI Markdown body (no CTA)
4. **Finalize** — append required BuildCore CTA section automatically
5. **Validate article** — BuildCore mentions (3+), SEO keyword placement, ≥1500 words, 5+ H2 sections, quality rules
6. **Retry once** per step if validation fails
7. **Write file** — `content/blog/posts/{slug}.md`

Batch runs (`--count>1`) are processed **sequentially** with a delay between OpenAI calls.

### Mock provider

Uses the same prompt builders for alignment, but generates deterministic local content via `mock-body.mjs` (no API calls).

## Preview generated articles

1. Generate drafts
2. Optionally set `draft: false` on one post for preview
3. `npm run build:blog`
4. `npx http-server -p 8777 -c-1`
5. Open http://127.0.0.1:8777/blog/

## Safety notes

- `--count` is capped at 50 per run
- Slugs are deduplicated within a batch unless `--overwrite` is used
- OpenAI output is validated before writing; failed validation retries once, then fails clearly
- Generation never runs during `build:blog`

## Recommended next steps

1. Editorial review checklist before setting `draft: false`
2. Optional `--topic` + human title refinement workflow
3. GitHub Actions only after review process is defined (not in scope yet)
4. Social post generation as a separate Phase 3 pipeline
