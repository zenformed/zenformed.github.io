// /js/testimonials-carousel.js
(function () {
  "use strict";

  let currentIndex = 0;
  let autoPlayInterval = null;
  let cards = null;
  let dots = [];

  // Truncate text to max length with ellipsis
  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text;
    }
    // Truncate and add ellipsis
    return text.substring(0, maxLength).trim() + "...";
  }

  // Apply truncation to all testimonial texts
  function truncateTestimonialTexts() {
    if (!cards || cards.length === 0) return;
    cards.forEach((card) => {
      const textElement = card.querySelector(".testimonials-card-text");
      if (textElement) {
        const originalText = textElement.textContent || textElement.innerText;
        const truncatedText = truncateText(originalText, 200);
        if (truncatedText !== originalText) {
          textElement.textContent = truncatedText;
        }
      }
    });
  }

  function updateCarousel() {
    if (!cards || cards.length === 0) return;
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  function goToSlide(index) {
    if (!cards || cards.length === 0) return;
    currentIndex = index;
    updateCarousel();
    resetAutoPlay();
  }

  function nextSlide() {
    if (!cards || cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
    resetAutoPlay();
  }

  function prevSlide() {
    if (!cards || cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
    resetAutoPlay();
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  function init() {
    const carousel = document.getElementById("testimonialsCarousel");
    const prevBtn = document.getElementById("testimonialsPrev");
    const nextBtn = document.getElementById("testimonialsNext");
    const dotsContainer = document.getElementById("testimonialsDots");

    if (!carousel || !prevBtn || !nextBtn || !dotsContainer) {
      return false;
    }

    cards = carousel.querySelectorAll(".testimonials-card");
    if (cards.length === 0) {
      return false;
    }

    if (carousel.dataset.initialized === "true") {
      return true;
    }
    carousel.dataset.initialized = "true";

    dotsContainer.innerHTML = "";
    dots = [];

    cards.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = `testimonials-dot ${index === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      dot.addEventListener("click", () => goToSlide(index));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });

    prevBtn.onclick = function (e) {
      e.preventDefault();
      prevSlide();
    };

    nextBtn.onclick = function (e) {
      e.preventDefault();
      nextSlide();
    };

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);

    // Truncate testimonial texts
    truncateTestimonialTexts();

    updateCarousel();
    startAutoPlay();
    return true;
  }

  // Try to initialize
  function tryInit() {
    if (init()) {
      return;
    }
    // Retry with requestAnimationFrame
    requestAnimationFrame(function () {
      if (!init()) {
        // Final retry with timeout
        setTimeout(function () {
          if (!init()) {
            setTimeout(init, 500);
          }
        }, 100);
      }
    });
  }

  // Start initialization
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    tryInit();
  } else {
    document.addEventListener("DOMContentLoaded", tryInit);
  }

  // Also try immediately in case script runs after DOM is ready
  tryInit();

  // Export for manual initialization if needed
  window.initTestimonialsCarousel = init;
})();
