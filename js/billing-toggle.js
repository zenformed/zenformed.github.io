// /js/billing-toggle.js — reusable monthly / annual billing segmented control

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {HTMLElement} container
 * @param {{
 *   defaultPeriod?: 'monthly' | 'annual',
 *   annualLabel?: string,
 *   onChange?: (period: 'monthly' | 'annual') => void
 * }} options
 */
export function mountBillingToggle(container, options = {}) {
  if (!container) return null;

  const defaultPeriod = options.defaultPeriod || 'monthly';
  const annualLabel = options.annualLabel || '2 months free';
  const onChange = options.onChange;

  let currentPeriod = defaultPeriod;

  container.className = 'billing-toggle';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', 'Billing period');

  container.innerHTML = `
    <button
      type="button"
      class="billing-toggle-option${defaultPeriod === 'monthly' ? ' billing-toggle-option--active' : ''}"
      role="tab"
      aria-selected="${defaultPeriod === 'monthly'}"
      data-billing="monthly"
    >
      Monthly
    </button>
    <button
      type="button"
      class="billing-toggle-option${defaultPeriod === 'annual' ? ' billing-toggle-option--active' : ''}"
      role="tab"
      aria-selected="${defaultPeriod === 'annual'}"
      data-billing="annual"
    >
      Annual
      <span class="billing-toggle-label">${escapeHtml(annualLabel)}</span>
    </button>
  `;

  function setPeriod(period) {
    if (period !== 'monthly' && period !== 'annual') return;
    currentPeriod = period;

    container.querySelectorAll('.billing-toggle-option').forEach((button) => {
      const isActive = button.dataset.billing === period;
      button.classList.toggle('billing-toggle-option--active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    onChange?.(period);
  }

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-billing]');
    if (!button) return;
    setPeriod(button.dataset.billing);
  });

  return {
    getPeriod: () => currentPeriod,
    setPeriod,
  };
}

window.mountBillingToggle = mountBillingToggle;
