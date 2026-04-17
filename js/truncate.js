// /js/truncate.js — short customer card blurbs in #customers
(function () {
  "use strict";

  const MAX_LENGTH = 60;

  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + "...";
  }

  function init() {
    const section = document.querySelector("#customers");
    if (!section) return;

    section.querySelectorAll(".customers-card-text").forEach((el) => {
      const original = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!original || original.length <= MAX_LENGTH) return;

      el.setAttribute("title", original);
      el.textContent = truncateText(original, MAX_LENGTH);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
