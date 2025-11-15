// /js/navbar.js
(function() {
  'use strict';
  
  function initNavbar() {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('#mobile-menu a');

    if (!btn || !menu) {
      return false;
    }

    // Prevent multiple initializations
    if (btn.dataset.initialized === 'true') {
      return true;
    }
    btn.dataset.initialized = 'true';

    function toggleMenu() {
      const isHidden = menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', !isHidden);
    }

    btn.onclick = toggleMenu;

    links.forEach(function(link) {
      link.onclick = function() {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      };
    });

    return true;
  }

  // Try to initialize
  function tryInit() {
    if (initNavbar()) {
      return;
    }
    // Retry with requestAnimationFrame
    requestAnimationFrame(function() {
      if (!initNavbar()) {
        // Final retry with timeout
        setTimeout(function() {
          if (!initNavbar()) {
            setTimeout(initNavbar, 500);
          }
        }, 100);
      }
    });
  }

  // Start initialization
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tryInit();
  } else {
    document.addEventListener('DOMContentLoaded', tryInit);
  }
  
  // Also try immediately in case script runs after DOM is ready
  tryInit();

  // Export for manual initialization if needed
  window.initNavbar = initNavbar;
})();

