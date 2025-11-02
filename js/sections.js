// /js/sections.js
export async function loadSection(selector, url) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    const html = await res.text();
    mount.innerHTML = html;

    // Execute any script tags that were loaded
    const scripts = mount.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  } catch (e) {
    mount.innerHTML = `<div class="p-4 text-red-600">Failed to load section: ${url}</div>`;
  }
}
// expose globally for simple inline calls in index.html
window.loadSection = loadSection;
