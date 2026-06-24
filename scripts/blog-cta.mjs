import { BLOG_APPS } from "./blog-apps.mjs";

/** @typedef {{ headlineTemplate: string; copy: string; benefits: string[]; buttonLabel: string }} BlogAppCtaConfig */

/** @type {Record<string, BlogAppCtaConfig>} */
export const BLOG_APP_CTA_CONFIG = {
  buildcore: {
    headlineTemplate: "Turn {topic} into accountable project workflows.",
    copy:
      "Manage approvals, documentation, reminders, and project tracking from one project record.",
    benefits: [
      "Customer approvals",
      "Workflow tracking",
      "Project documentation",
      "Reporting",
    ],
    buttonLabel: "Explore BuildCore",
  },
  forgecore: {
    headlineTemplate: "Bring {topic} into one connected construction workflow.",
    copy:
      "Coordinate process automation, team handoffs, and operational visibility from one system of record.",
    benefits: [
      "Process automation",
      "Team coordination",
      "Document routing",
      "Status visibility",
      "Operational reporting",
    ],
    buttonLabel: "Explore ForgeCore",
  },
  formcore: {
    headlineTemplate: "Standardize {topic} with forms your teams actually use.",
    copy:
      "Capture field data, structure job records, and keep audit-ready documentation tied to each project.",
    benefits: [
      "Digital forms",
      "Field capture",
      "Structured data",
      "Job-linked records",
      "Audit-ready exports",
    ],
    buttonLabel: "Explore FormCore",
  },
  analyticscore: {
    headlineTemplate: "Turn {topic} into clear operational insight across active jobs.",
    copy:
      "Track performance, compare projects, and surface decision-ready reporting from one dashboard.",
    benefits: [
      "Job dashboards",
      "Performance metrics",
      "Trend reporting",
      "Cross-project views",
      "Decision-ready data",
    ],
    buttonLabel: "Explore AnalyticsCore",
  },
};

export const CTA_COMMENT_PREFIX = "<!-- zenformed-product-cta:";
export const LEGACY_CTA_HEADING = "## Improve Your Construction Workflow with BuildCore";
export const CTA_ROOT_CLASS = "blog-product-cta";

/**
 * @param {string} body
 */
export function findCtaStart(body) {
  const commentIndex = body.indexOf(CTA_COMMENT_PREFIX);
  if (commentIndex !== -1) {
    return commentIndex;
  }

  const legacyHeadingIndex = body.indexOf(LEGACY_CTA_HEADING);
  if (legacyHeadingIndex !== -1) {
    return legacyHeadingIndex;
  }

  const classMarker = `class="${CTA_ROOT_CLASS}"`;
  const classIndex = body.indexOf(classMarker);
  if (classIndex !== -1) {
    const asideIndex = body.lastIndexOf("<aside", classIndex);
    if (asideIndex !== -1) {
      return asideIndex;
    }

    return body.lastIndexOf("<", classIndex);
  }

  return -1;
}

/**
 * @param {string} appKey
 */
export function resolveCtaConfig(appKey) {
  const key = String(appKey ?? "buildcore").trim().toLowerCase();
  const app = BLOG_APPS[key];
  const cta = BLOG_APP_CTA_CONFIG[key];

  if (!app || !cta) {
    throw new Error(`Unknown blog CTA app "${appKey}".`);
  }

  return { app, cta, appKey: key };
}

/**
 * @param {string} template
 * @param {string} topicLabel
 */
function formatTemplate(template, topicLabel) {
  return template.replaceAll("{topic}", topicLabel.toLowerCase());
}

/**
 * @param {object} options
 * @param {string} options.appKey
 * @param {string} [options.topicLabel]
 */
export function buildProductCtaHtml({ appKey, topicLabel = "your construction workflow" }) {
  const { app, cta, appKey: key } = resolveCtaConfig(appKey);
  const headline = formatTemplate(cta.headlineTemplate, topicLabel);
  const benefits = cta.benefits
    .map(
      (benefit) =>
        `          <li class="blog-product-cta__benefit"><span class="blog-product-cta__check" aria-hidden="true"></span>${benefit}</li>`,
    )
    .join("\n");

  return [
    `<!-- zenformed-product-cta:${key} -->`,
    `<aside class="${CTA_ROOT_CLASS}" data-app="${key}" aria-label="${app.name} product call to action">`,
    `  <div class="blog-product-cta__glow" aria-hidden="true"></div>`,
    `  <div class="blog-product-cta__inner">`,
    `    <div class="blog-product-cta__top">`,
    `      <div class="blog-product-cta__brand">`,
    `        <img src="${app.icon}" alt="" class="blog-product-cta__icon" width="52" height="52" loading="lazy" decoding="async" />`,
    `        <h2 class="blog-product-cta__title">${app.name}</h2>`,
    `      </div>`,
    `      <div class="blog-product-cta__content">`,
    `        <p class="blog-product-cta__headline">${headline}</p>`,
    `      </div>`,
    `    </div>`,
    `    <ul class="blog-product-cta__benefits">`,
    benefits,
    `    </ul>`,
    `    <div class="blog-product-cta__action">`,
    `      <a href="${app.productUrl}" class="blog-product-cta__button">${cta.buttonLabel}<span class="blog-product-cta__arrow" aria-hidden="true">→</span></a>`,
    `    </div>`,
    `  </div>`,
    `</aside>`,
  ].join("\n");
}
