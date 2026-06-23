// /js/pricing-plans.js — reusable pricing grid for product plan pages

import { mountBillingToggle } from './billing-toggle.js';

const SHARED_FEATURES = [
  'Construction CRM',
  'Project and subproject management',
  'Workflow tasks',
  'Customer uploads',
  'Unlimited project photos and documents',
  'Milestone payments',
  'Budgets',
  'Reporting and PDF exports',
];

const DEFAULT_FILE_STORAGE_BENEFIT =
  'Unlimited project photos, documents, and customer uploads included.';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPriceMonthly(amount) {
  return `$${amount}/mo`;
}

function formatPriceAnnual(amount) {
  return `$${amount.toLocaleString('en-US')}/year`;
}

function formatAnnualEquivalent(amount) {
  return `$${Math.round(amount / 12).toLocaleString('en-US')}/mo`;
}

function renderFeatureList(features, supportLevel) {
  const items = features
    .map((feature) => `<li>• ${escapeHtml(feature)}</li>`)
    .join('');

  const support = supportLevel
    ? `<li>• ${escapeHtml(supportLevel)}</li>`
    : '';

  return `<ul class="space-y-3 text-gray-400 mb-6 text-sm pricing-plan-features">${items}${support}</ul>`;
}

function renderPlanCard(plan, ctaHref, fileStorageBenefit, billingPeriod) {
  const recommended = Boolean(plan.recommended);
  const cardClasses = [
    'services-card',
    'flex',
    'flex-col',
    'pricing-plan-card',
    recommended ? 'relative border-white/40 border md:scale-105' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badge = recommended
    ? `<div class="absolute top-0 right-0 bg-white text-black text-xs px-3 py-1 rounded-bl-md rounded-tr-md font-semibold uppercase pricing-plan-badge">Recommended</div>`
    : '';

  const ctaClasses = recommended
    ? 'block w-full text-center bg-white text-black font-semibold py-3 rounded-md hover:opacity-90 transition'
    : 'block w-full text-center border border-white/20 py-3 rounded-md hover:bg-white/10 transition';

  const storageBenefit =
    plan.fileStorageBenefit || fileStorageBenefit || DEFAULT_FILE_STORAGE_BENEFIT;

  const isAnnual = billingPeriod === 'annual';
  const priceDisplay = isAnnual
    ? formatPriceAnnual(plan.annualAmount)
    : formatPriceMonthly(plan.monthlyAmount);
  const priceDetail = isAnnual
    ? `≈ ${formatAnnualEquivalent(plan.annualAmount)} billed annually`
    : '';

  return `
    <article
      class="${cardClasses}"
      data-monthly-amount="${plan.monthlyAmount}"
      data-annual-amount="${plan.annualAmount}"
    >
      ${badge}
      <div class="services-card-content p-4 flex flex-col flex-grow">
        <h3 class="services-card-title mb-2 text-2xl font-bold">${escapeHtml(plan.name)}</h3>
        <div class="pricing-plan-price-wrap">
          <p class="pricing-plan-price" data-pricing-display>${escapeHtml(priceDisplay)}</p>
          <p class="pricing-plan-price-detail${priceDetail ? '' : ' hidden'}" data-pricing-detail${priceDetail ? '' : ' aria-hidden="true"'}>${escapeHtml(priceDetail)}</p>
        </div>
        <dl class="pricing-plan-specs">
          <div class="pricing-plan-spec">
            <dt>Seats</dt>
            <dd>${escapeHtml(String(plan.seats))}</dd>
          </div>
        </dl>
        <p class="pricing-plan-file-benefit">${escapeHtml(storageBenefit)}</p>
        ${renderFeatureList(plan.features || SHARED_FEATURES, plan.supportLevel)}
        <a href="${escapeHtml(ctaHref)}" class="${ctaClasses}">${escapeHtml(plan.cta)}</a>
      </div>
    </article>
  `;
}

function updatePricingDisplay(grid, period) {
  if (!grid) return;

  grid.querySelectorAll('.pricing-plan-card').forEach((card) => {
    const monthlyAmount = Number(card.dataset.monthlyAmount);
    const annualAmount = Number(card.dataset.annualAmount);
    const priceEl = card.querySelector('[data-pricing-display]');
    const detailEl = card.querySelector('[data-pricing-detail]');

    if (!priceEl || !detailEl) return;

    if (period === 'annual') {
      priceEl.textContent = formatPriceAnnual(annualAmount);
      detailEl.textContent = `≈ ${formatAnnualEquivalent(annualAmount)} billed annually`;
      detailEl.classList.remove('hidden');
      detailEl.removeAttribute('aria-hidden');
      return;
    }

    priceEl.textContent = formatPriceMonthly(monthlyAmount);
    detailEl.textContent = '';
    detailEl.classList.add('hidden');
    detailEl.setAttribute('aria-hidden', 'true');
  });
}

/**
 * @param {HTMLElement} mount
 * @param {{
 *   label?: string,
 *   title: string,
 *   intro: string,
 *   annualToggleLabel?: string,
 *   fileStorageBenefit?: string,
 *   storageHighlight?: string,
 *   plans: Array<{
 *     name: string,
 *     monthlyAmount: number,
 *     annualAmount: number,
 *     seats: number,
 *     storageEntitlement?: string,
 *     fileStorageBenefit?: string,
 *     supportLevel?: string,
 *     features?: string[],
 *     cta: string,
 *     recommended?: boolean
 *   }>,
 *   ctaHref?: string
 * }} config
 */
export function renderPricingPlans(mount, config) {
  if (!mount) return;

  const label = config.label || 'Plans';
  const ctaHref = config.ctaHref || '/#contact';
  const fileStorageBenefit =
    config.fileStorageBenefit || DEFAULT_FILE_STORAGE_BENEFIT;
  const storageHighlight =
    config.storageHighlight || fileStorageBenefit;
  const annualToggleLabel = config.annualToggleLabel || '2 months free';
  const defaultBillingPeriod = 'monthly';

  const cards = config.plans
    .map((plan) =>
      renderPlanCard(plan, ctaHref, fileStorageBenefit, defaultBillingPeriod)
    )
    .join('');

  mount.innerHTML = `
    <p class="services-label">${escapeHtml(label)}</p>
    <h1 class="services-title">${escapeHtml(config.title)}</h1>
    <p class="services-description pricing-plans-intro">${escapeHtml(config.intro)}</p>
    <p class="pricing-plans-storage-highlight">${escapeHtml(storageHighlight)}</p>
    <div class="pricing-plans-billing-toggle">
      <div id="pricing-billing-toggle"></div>
    </div>
    <div class="services-grid pricing-plans-grid items-start" data-pricing-grid>${cards}</div>
  `;

  const grid = mount.querySelector('[data-pricing-grid]');
  const toggleMount = mount.querySelector('#pricing-billing-toggle');

  mountBillingToggle(toggleMount, {
    defaultPeriod: defaultBillingPeriod,
    annualLabel: annualToggleLabel,
    onChange: (period) => updatePricingDisplay(grid, period),
  });
}

export const BUILDCORE_PLANS = {
  label: 'BuildCore',
  title: 'Choose the plan that fits your team',
  intro:
    'BuildCore is a construction CRM for project and subproject management, workflow tasks, customer uploads, milestone payments, budgets, and reporting.',
  storageHighlight: DEFAULT_FILE_STORAGE_BENEFIT,
  annualToggleLabel: '2 months free',
  fileStorageBenefit: DEFAULT_FILE_STORAGE_BENEFIT,
  ctaHref: '/#contact',
  plans: [
    {
      name: 'Starter',
      monthlyAmount: 129,
      annualAmount: 1290,
      seats: 3,
      supportLevel: 'Email support',
      cta: 'Start with Starter',
      recommended: false,
    },
    {
      name: 'Growth',
      monthlyAmount: 299,
      annualAmount: 2990,
      seats: 10,
      supportLevel: 'Priority email support',
      cta: 'Choose Growth',
      recommended: true,
    },
    {
      name: 'Pro',
      monthlyAmount: 499,
      annualAmount: 4990,
      seats: 25,
      supportLevel: 'Priority support and onboarding',
      cta: 'Choose Pro',
      recommended: false,
    },
  ],
};

window.renderPricingPlans = renderPricingPlans;
