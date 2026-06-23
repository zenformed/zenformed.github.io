// /js/hero-animations.js
// Hero section fade-in animations and video controls

function fadeIn(element, delay = 0) {
  element.style.opacity = "0";
  element.style.transition = "opacity 0.6s ease-out";

  setTimeout(() => {
    element.style.opacity = "1";
  }, delay);
}

function initHeroVideo() {
  const media = document.querySelector(".hero-right-media");
  const video = media?.querySelector("video");
  const button = media?.querySelector(".hero-video-play");
  const icon = button?.querySelector(".hero-video-play-icon");

  if (!media || !video || !button || !icon) return;

  video.volume = 0.5;

  function syncState() {
    const isPlaying = !video.paused && !video.ended;
    media.classList.toggle("is-playing", isPlaying);
    button.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
    button.setAttribute("aria-pressed", String(isPlaying));
    icon.dataset.state = isPlaying ? "pause" : "play";
  }

  async function toggleVideo() {
    if (video.paused || video.ended) {
      await video.play();
    } else {
      video.pause();
    }
  }

  button.addEventListener("click", () => {
    toggleVideo().catch(() => {});
  });

  video.addEventListener("click", () => {
    toggleVideo().catch(() => {});
  });

  video.addEventListener("play", syncState);
  video.addEventListener("pause", syncState);
  video.addEventListener("ended", syncState);
  syncState();
}

export function initHeroAnimations() {
  initHeroVideo();

  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroButtons = document.querySelector(".hero-buttons");

  if (heroTitle) {
    fadeIn(heroTitle, 0);
  }

  if (heroSubtitle) {
    fadeIn(heroSubtitle, 150);
  }

  if (heroButtons) {
    fadeIn(heroButtons, 250);
  }
}
