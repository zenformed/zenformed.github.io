import "./load-env.mjs";
import { printStartupDiagnostics } from "./load-env.mjs";
import { generateArticles } from "./pipeline/generate-article.mjs";
import { listTopicIds } from "./topics.mjs";

function parseArgs(argv) {
  const options = {
    count: 1,
    provider: "mock",
    overwrite: false,
    schedule: false,
  };

  for (const arg of argv) {
    if (arg.startsWith("--count=")) {
      options.count = Number.parseInt(arg.slice("--count=".length), 10);
    } else if (arg.startsWith("--provider=")) {
      options.provider = arg.slice("--provider=".length);
    } else if (arg.startsWith("--topic=")) {
      options.topicId = arg.slice("--topic=".length);
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--schedule") {
      options.schedule = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: npm run generate:blog -- [options]

Options:
  --count=N          Number of articles to generate (default: 1)
  --provider=NAME    Generator provider: mock | openai (default: mock)
  --topic=TOPIC_ID   Target a specific topic from the catalog
  --overwrite        Replace an existing post file with the same slug
  --schedule         Stagger publishDate across the batch (today + N days)
  --help             Show this help

Examples:
  npm run generate:blog
  npm run generate:blog -- --count=3
  npm run generate:blog -- --count=1 --provider=openai
  npm run generate:blog -- --count=10 --provider=openai --schedule
  npm run generate:blog -- --provider=openai --topic=customer-approval-workflows

Environment (OpenAI provider only):
  OPENAI_API_KEY       Required for --provider=openai (set in .env.local or shell)
  OPENAI_BLOG_MODEL    Optional model override (default: gpt-4o-mini)

Topic IDs:
  ${listTopicIds().join(", ")}

Generated markdown files are written to content/blog/posts/ as drafts.
Build with: npm run build:blog (drafts are excluded until published).
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error("--count must be a positive integer.");
  }

  if (options.count > 50) {
    throw new Error("--count above 50 is blocked for safety. Generate in smaller batches.");
  }

  printStartupDiagnostics({ provider: options.provider });

  console.log(
    `Starting blog generation (${options.count} article(s), provider: ${options.provider})...`,
  );

  const results = await generateArticles({
    count: options.count,
    provider: options.provider,
    topicId: options.topicId,
    overwrite: options.overwrite,
    schedule: options.schedule,
  });

  console.log(`\nDone. Generated ${results.length} draft article(s).`);
  if (options.schedule) {
    console.log(
      "Scheduled publishDate values were written to frontmatter. Set draft: false to publish on each date.",
    );
  } else {
    console.log("Next: review markdown in content/blog/posts/, then set draft: false to publish.");
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
