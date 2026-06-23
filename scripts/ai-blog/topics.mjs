/** @typedef {object} BlogTopic
 * @property {string} id
 * @property {string} label
 * @property {string} slugHint
 * @property {string} summary
 * @property {string[]} tags
 * @property {string[]} angles
 */

/** @type {BlogTopic[]} */
export const BLOG_TOPICS = [
  {
    id: "contractor-crm",
    label: "Contractor CRM",
    slugHint: "contractor-crm",
    summary: "Managing leads, customers, and job history in one system.",
    tags: ["buildcore", "crm", "contractors"],
    angles: ["lead follow-up", "customer timelines", "repeat work"],
  },
  {
    id: "construction-project-management",
    label: "Construction Project Management",
    slugHint: "construction-project-management",
    summary: "Coordinating schedules, crews, and deliverables across active jobs.",
    tags: ["buildcore", "project-management", "construction"],
    angles: ["milestones", "handoffs", "scope clarity"],
  },
  {
    id: "customer-approval-workflows",
    label: "Customer Approval Workflows",
    slugHint: "customer-approval-workflows",
    summary: "Getting sign-off on selections, change requests, and deliverables.",
    tags: ["buildcore", "workflows", "customer-experience"],
    angles: ["approvals", "documentation", "fewer disputes"],
  },
  {
    id: "budget-tracking",
    label: "Budget Tracking",
    slugHint: "budget-tracking-for-contractors",
    summary: "Monitoring committed costs, actuals, and remaining budget by job.",
    tags: ["buildcore", "budgeting", "finance"],
    angles: ["cost control", "forecasting", "margin protection"],
  },
  {
    id: "team-accountability",
    label: "Team Accountability",
    slugHint: "construction-team-accountability",
    summary: "Assigning ownership and tracking follow-through across the field and office.",
    tags: ["buildcore", "operations", "teams"],
    angles: ["task ownership", "checklists", "accountability"],
  },
  {
    id: "construction-reporting",
    label: "Construction Reporting",
    slugHint: "construction-reporting",
    summary: "Turning job data into reports owners and PMs can act on.",
    tags: ["buildcore", "reporting", "analytics"],
    angles: ["job status", "pipeline visibility", "executive summaries"],
  },
  {
    id: "change-orders",
    label: "Change Orders",
    slugHint: "construction-change-orders",
    summary: "Capturing scope changes, pricing, and approvals without losing margin.",
    tags: ["buildcore", "change-orders", "contractors"],
    angles: ["scope creep", "approval trails", "billing alignment"],
  },
  {
    id: "job-costing",
    label: "Job Costing",
    slugHint: "construction-job-costing",
    summary: "Understanding true cost by phase, trade, and change event.",
    tags: ["buildcore", "job-costing", "finance"],
    angles: ["labor and materials", "variance analysis", "profitable estimating"],
  },
  {
    id: "construction-scheduling",
    label: "Construction Scheduling",
    slugHint: "construction-scheduling",
    summary: "Keeping crews, subs, and inspections aligned on realistic timelines.",
    tags: ["buildcore", "scheduling", "operations"],
    angles: ["dependencies", "delays", "look-ahead planning"],
  },
  {
    id: "project-documentation",
    label: "Project Documentation",
    slugHint: "construction-project-documentation",
    summary: "Organizing photos, permits, submittals, and closeout packages.",
    tags: ["buildcore", "documentation", "compliance"],
    angles: ["record keeping", "audit readiness", "closeout"],
  },
];

export function getTopicById(id) {
  return BLOG_TOPICS.find((topic) => topic.id === id) ?? null;
}

export function listTopicIds() {
  return BLOG_TOPICS.map((topic) => topic.id);
}

/**
 * @param {BlogTopic} topic
 */
export function getTopicKeyword(topic) {
  if (topic.keyword) {
    return topic.keyword;
  }

  return topic.slugHint.replace(/-/g, " ");
}
