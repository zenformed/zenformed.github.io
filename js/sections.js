// /js/sections.js
export async function loadSection(selector, url) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    mount.innerHTML = await res.text();
  } catch (e) {
    mount.innerHTML = `<div class="p-4 text-red-600">Failed to load section: ${url}</div>`;
  }
}
// expose globally for simple inline calls in index.html
window.loadSection = loadSection;
