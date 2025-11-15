// /js/sections.js
export async function loadSection(selector, url) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    const html = await res.text();
    mount.innerHTML = html;

    // Execute any script tags that were loaded
    // Note: Inline scripts in loaded sections are not executed for security and compatibility
    // Use external script files loaded in index.html instead
    const scripts = Array.from(mount.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      try {
        // Only handle external scripts
        if (oldScript.src) {
          const newScript = document.createElement("script");
          newScript.src = oldScript.src;
          if (oldScript.type) {
            newScript.type = oldScript.type;
          }
          if (oldScript.async) newScript.async = true;
          if (oldScript.defer) newScript.defer = true;
          const parent = oldScript.parentNode;
          if (parent) {
            parent.insertBefore(newScript, oldScript);
            parent.removeChild(oldScript);
          }
        } else {
          // Remove inline scripts - they should be in external files
          const parent = oldScript.parentNode;
          if (parent) {
            parent.removeChild(oldScript);
          }
        }
      } catch (e) {
        console.error('Error handling script:', e);
      }
    });
  } catch (e) {
    mount.innerHTML = `<div class="p-4 text-red-600">Failed to load section: ${url}</div>`;
  }
}
// expose globally for simple inline calls in index.html
window.loadSection = loadSection;
