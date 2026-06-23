/** @typedef {{ name: string; icon: string; productUrl: string }} BlogApp */

/** @type {Record<string, BlogApp>} */
export const BLOG_APPS = {
  buildcore: {
    name: "BuildCore",
    icon: "/images/zenformed-app-icons/buildcore.png",
    productUrl: "https://core.zenformed.com/products/buildcore",
  },
  forgecore: {
    name: "ForgeCore",
    icon: "/images/zenformed-app-icons/forgecore.png",
    productUrl: "https://core.zenformed.com/products/forgecore",
  },
  formcore: {
    name: "FormCore",
    icon: "/images/zenformed-app-icons/formcore.png",
    productUrl: "https://core.zenformed.com/products/formcore",
  },
  analyticscore: {
    name: "AnalyticsCore",
    icon: "/images/zenformed-app-icons/analyticscore.png",
    productUrl: "https://core.zenformed.com/products/analyticscore",
  },
};

/**
 * @param {unknown} appKey
 * @param {string} [sourceFile]
 * @returns {BlogApp | null}
 */
export function resolveBlogApp(appKey, sourceFile) {
  if (appKey === undefined || appKey === null || String(appKey).trim() === "") {
    return null;
  }

  const key = String(appKey).trim().toLowerCase();
  const app = BLOG_APPS[key];

  if (!app) {
    const label = sourceFile ? ` (${sourceFile})` : "";
    console.warn(`Unknown blog app "${appKey}"${label}; skipping app icon.`);
    return null;
  }

  return app;
}
