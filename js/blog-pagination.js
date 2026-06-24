(function initBlogPagination() {
  const PAGE_SIZE = 10;
  const list = document.querySelector(".blog-list");
  const nav = document.getElementById("blog-pagination");

  if (!list || !nav) {
    return;
  }

  const cards = [...list.querySelectorAll(".blog-card")];
  if (cards.length <= PAGE_SIZE) {
    nav.hidden = true;
    return;
  }

  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  let currentPage = 1;

  const summary = document.createElement("p");
  summary.className = "blog-pagination__summary";

  const controls = document.createElement("div");
  controls.className = "blog-pagination__controls";

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className =
    "blog-pagination__button blog-pagination__button--prev";
  prevButton.textContent = "Previous";

  const pages = document.createElement("div");
  pages.className = "blog-pagination__pages";
  pages.setAttribute("role", "group");
  pages.setAttribute("aria-label", "Blog pages");

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className =
    "blog-pagination__button blog-pagination__button--next";
  nextButton.textContent = "Next";

  controls.append(prevButton, pages, nextButton);
  nav.append(summary, controls);
  nav.hidden = false;

  function pageRange(page) {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, cards.length);
    return { start, end };
  }

  function renderPageButtons() {
    pages.replaceChildren();

    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "blog-pagination__page";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Page ${page}`);

      if (page === currentPage) {
        button.classList.add("is-active");
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", () => {
        showPage(page);
      });

      pages.append(button);
    }
  }

  function updateSummary() {
    const { start, end } = pageRange(currentPage);
    summary.textContent = `Showing ${start}–${end} of ${cards.length} articles · Page ${currentPage} of ${totalPages}`;
  }

  function showPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));

    cards.forEach((card, index) => {
      const cardPage = Math.floor(index / PAGE_SIZE) + 1;
      card.hidden = cardPage !== currentPage;
    });

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    renderPageButtons();
    updateSummary();
    list.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  prevButton.addEventListener("click", () => {
    showPage(currentPage - 1);
  });

  nextButton.addEventListener("click", () => {
    showPage(currentPage + 1);
  });

  showPage(1);
})();
