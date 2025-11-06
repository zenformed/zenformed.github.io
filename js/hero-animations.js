// /js/hero-animations.js
// Hero section letter-by-letter and fade-in animations

/**
 * Wraps each letter in a text node with a span for animation
 * Preserves HTML elements like <br> tags
 */
function wrapLetters(element) {
  // Clone the element to work with
  const clone = element.cloneNode(true);
  const fragment = document.createDocumentFragment();

  let shouldTrimNext = true; // Track if we should trim the next text node

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Trim leading whitespace from text nodes that come after elements or at the start
      let text = node.textContent;
      if (shouldTrimNext) {
        text = text.trimStart();
        shouldTrimNext = false;
      }

      // Skip empty text nodes
      if (!text) return;

      // Split text into words (keeping spaces)
      const words = text.split(/(\s+)/);

      words.forEach((word) => {
        // Skip empty strings
        if (!word) return;

        // If it's whitespace, create a space span
        if (/^\s+$/.test(word)) {
          const spaceSpan = document.createElement("span");
          spaceSpan.textContent = word;
          spaceSpan.style.opacity = "0";
          spaceSpan.style.filter = "blur(4px)";
          spaceSpan.style.display = "inline-block";
          spaceSpan.style.width = "0.25em";
          spaceSpan.style.minWidth = "0.25em";
          spaceSpan.style.margin = "0";
          spaceSpan.style.padding = "0";
          spaceSpan.style.verticalAlign = "baseline";
          fragment.appendChild(spaceSpan);
          return;
        }

        // For words, wrap in a word container so they stay together
        const wordContainer = document.createElement("span");
        wordContainer.style.display = "inline-block";
        wordContainer.style.whiteSpace = "nowrap"; // Keep word together

        // Split word into individual characters
        const characters = word.split("");
        characters.forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.opacity = "0";
          span.style.filter = "blur(4px)"; // Start with blur
          span.style.display = "inline-block";
          span.style.margin = "0";
          span.style.padding = "0";
          span.style.verticalAlign = "baseline";
          wordContainer.appendChild(span);
        });

        fragment.appendChild(wordContainer);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // After encountering an element (like <br>), trim the next text node
      shouldTrimNext = true;
      // Preserve HTML elements like <br>
      const preserved = node.cloneNode(true);
      fragment.appendChild(preserved);
    }
  }

  // Process all child nodes
  Array.from(clone.childNodes).forEach(processNode);

  // Replace element content
  element.innerHTML = "";
  element.appendChild(fragment);
}

/**
 * Animates letters fading in one by one
 */
function animateLetters(element, delay = 30) {
  // Get all letter spans (nested inside word containers) and space spans
  // Word containers have child spans (letters), space spans don't
  const allSpans = element.querySelectorAll("span");
  const letters = Array.from(allSpans).filter((span) => {
    // Include spans that are inside word containers (have a parent span)
    // or are space spans (have no child spans)
    return span.parentElement.tagName === "SPAN" || span.children.length === 0;
  });

  let index = 0;

  function animateNext() {
    if (index < letters.length) {
      const letter = letters[index];
      // Animate both opacity and blur together
      letter.style.transition = "opacity 0.4s ease-out, filter 0.4s ease-out";
      letter.style.opacity = "1";
      letter.style.filter = "blur(0px)"; // Clear the blur
      index++;
      setTimeout(animateNext, delay);
    }
  }

  animateNext();
}

/**
 * Animates a single element fading in
 */
function fadeIn(element, delay = 0) {
  element.style.opacity = "0";
  element.style.transition = "opacity 0.6s ease-out";

  setTimeout(() => {
    element.style.opacity = "1";
  }, delay);
}

/**
 * Initialize hero animations
 */
export function initHeroAnimations() {
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroButtons = document.querySelector(".hero-buttons");

  if (!heroTitle) return;

  // Wrap letters in the title
  wrapLetters(heroTitle);

  // Start title animation immediately
  animateLetters(heroTitle, 15);

  // Calculate delay for subtitle and buttons (after title animation completes)
  // Get all letter spans (nested inside word containers) and space spans
  const allSpans = heroTitle.querySelectorAll("span");
  const titleLetters = Array.from(allSpans).filter((span) => {
    return span.parentElement.tagName === "SPAN" || span.children.length === 0;
  });
  const titleAnimationDuration = titleLetters.length * 15;
  const subtitleDelay = titleAnimationDuration + 200; // 200ms pause after title

  // Fade in subtitle
  if (heroSubtitle) {
    fadeIn(heroSubtitle, subtitleDelay);
  }

  // Fade in buttons
  if (heroButtons) {
    fadeIn(heroButtons, subtitleDelay + 100); // 100ms after subtitle
  }
}
