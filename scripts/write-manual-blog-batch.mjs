import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildProductCtaHtml } from "../scripts/blog-cta.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsDir = path.resolve(__dirname, "..", "content", "blog", "posts");

const schedule = [
  { slug: "contractor-crm", date: "2026-07-09", topicLabel: "contractor CRM" },
  { slug: "customer-approval-workflows", date: "2026-07-10", topicLabel: "customer approval workflows" },
  { slug: "construction-project-management", date: "2026-07-11", topicLabel: "construction project management" },
  { slug: "construction-budget-tracking", date: "2026-07-12", topicLabel: "construction budget tracking" },
  { slug: "construction-team-accountability", date: "2026-07-13", topicLabel: "construction team accountability" },
  { slug: "construction-reporting", date: "2026-07-14", topicLabel: "construction reporting" },
  { slug: "construction-change-orders", date: "2026-07-15", topicLabel: "construction change orders" },
  { slug: "construction-job-costing", date: "2026-07-16", topicLabel: "construction job costing" },
  { slug: "construction-scheduling", date: "2026-07-17", topicLabel: "construction scheduling" },
  { slug: "construction-project-documentation", date: "2026-07-18", topicLabel: "construction project documentation" },
];

const contentProfiles = {
  "contractor-crm": {
    title: "Contractor CRM Playbook for Reliable Handoffs and Follow-Through",
    description: "Learn how to run a contractor CRM that tracks commitments from lead intake through warranty so teams stop losing context between office and field.",
    focusAreas: ["lead qualification standards", "proposal assumptions and exclusions", "preconstruction handoff quality", "warranty follow-up discipline"],
    risks: ["orphaned follow-up commitments", "proposal context disappearing after award", "mixed customer communication channels", "late visibility into stalled opportunities"],
    examples: ["remodeling pipeline management", "repeat-client nurturing workflows", "service work conversion tracking", "office-to-field kickoff synchronization"],
    metrics: ["qualified-to-awarded conversion cycle time", "open commitments older than 48 hours", "handoffs missing required kickoff artifacts", "warranty response timeliness"],
  },
  "customer-approval-workflows": {
    title: "Customer Approval Workflows That Prevent Delays and Disputes",
    description: "Build customer approval workflows for selections, changes, and closeout decisions so projects move faster with clean records and fewer scope disputes.",
    focusAreas: ["selection decision packets", "change request review standards", "approval authority mapping", "closeout acceptance history"],
    risks: ["missing impact context in requests", "decision history fragmented across channels", "approvals sent to non-authorized contacts", "approved changes not flowing into execution"],
    examples: ["fixture selection releases", "owner-requested scope revisions", "punch completion sign-offs", "material substitution approvals"],
    metrics: ["approval cycle time by category", "overdue approvals with procurement impact", "reopened requests due to missing information", "approval-to-execution handoff lag"],
  },
  "construction-project-management": {
    title: "Construction Project Management Framework for Predictable Execution",
    description: "Use this construction project management framework to align field and office workflows, reduce blocker delays, and improve schedule reliability.",
    focusAreas: ["phase-gated work packaging", "blocker escalation governance", "look-ahead readiness checks", "closeout-forward planning"],
    risks: ["dependencies discovered after mobilization", "inconsistent daily field signal quality", "slow escalation of milestone threats", "late closeout preparation"],
    examples: ["tenant improvement sequencing", "multi-trade coordination reviews", "inspection readiness alignment", "procurement milestone governance"],
    metrics: ["look-ahead commitment hit rate", "blockers unresolved beyond SLA", "milestone variance against forecast", "open closeout items in final phase"],
  },
  "construction-budget-tracking": {
    title: "Construction Budget Tracking System for Early Margin Protection",
    description: "Improve construction budget tracking with commitment controls, variance action plans, and weekly cost-to-complete updates grounded in field reality.",
    focusAreas: ["commitment timing controls", "pending exposure visibility", "weekly cost-to-complete forecasting", "variance action ownership"],
    risks: ["late commitment posting", "forecast drift without field input", "cost-code variance without action plans", "hidden exposure from pending changes"],
    examples: ["drywall productivity correction", "subcontract commitment monitoring", "scope-driven reforecasting", "contingency protection decisions"],
    metrics: ["forecast accuracy by cost code", "unposted commitments aged over seven days", "pending exposure versus contingency", "mitigation action completion rate"],
  },
  "construction-team-accountability": {
    title: "Construction Team Accountability Without Micromanagement",
    description: "Create construction team accountability with clear ownership, task visibility, and escalation habits that improve execution without slowing crews down.",
    focusAreas: ["owner-based task assignment", "definition-of-done clarity", "escalation timing expectations", "cross-team commitment visibility"],
    risks: ["team-level assignments with no owner", "overdue tasks without escalation", "repeated blocker discussions without closure", "separate field and office action lists"],
    examples: ["utility crew dependency tracking", "foreman-to-PM handoff reviews", "coordinator action closure cadence", "post-mortem workflow updates"],
    metrics: ["high-risk overdue commitments", "tasks reopened due to unclear completion", "time-to-escalate critical blockers", "recurring misses fixed by process changes"],
  },
  "construction-reporting": {
    title: "Construction Reporting That Drives Decisions Instead of Noise",
    description: "Improve construction reporting with role-specific dashboards, action-oriented weekly reviews, and documentation standards that support faster decisions.",
    focusAreas: ["exception-first reporting structure", "decision owner mapping", "field-to-office status consistency", "evidence-linked reporting"],
    risks: ["activity-heavy reports with no decisions", "unclear severity definitions", "leadership dashboards hiding exceptions", "action items disconnected from reports"],
    examples: ["weekly risk review packs", "daily superintendent signal capture", "executive exception dashboards", "cross-project trend monitoring"],
    metrics: ["decision requests resolved on time", "report-driven actions closed by due date", "repeat unresolved items week-over-week", "field update timeliness"],
  },
  "construction-change-orders": {
    title: "Construction Change Orders Workflow for Control and Clarity",
    description: "Run construction change orders with better scope definition, approval timing, and documentation controls so teams reduce disputes and protect margin.",
    focusAreas: ["potential change event capture", "scope clarity before pricing", "approval threshold governance", "baseline update discipline"],
    risks: ["work starting before formal approval", "scope narratives mixing facts and assumptions", "missing schedule impact details", "slow baseline updates after approval"],
    examples: ["hidden condition response workflow", "owner-initiated scope additions", "code-driven design changes", "substitution approval packets"],
    metrics: ["changes logged before execution", "change identification to approval cycle time", "changes with schedule impact documented", "closeout disputes tied to change history"],
  },
  "construction-job-costing": {
    title: "Construction Job Costing for Better Forecast Accuracy",
    description: "Strengthen construction job costing with disciplined cost-code practices, field feedback loops, and forecast updates that reveal variance early.",
    focusAreas: ["cost-code dictionary governance", "estimate-to-cost mapping", "rework cost tagging", "forecast rationale discipline"],
    risks: ["inconsistent cost coding", "late labor posting", "estimate assumptions lost during execution", "rework buried in broad categories"],
    examples: ["sitework labor trend analysis", "concrete production variance review", "weather disruption cost capture", "estimating feedback loop design"],
    metrics: ["cost-code forecast error at closeout", "labor posting latency", "variance items lacking root cause", "rework ratio by project type"],
  },
  "construction-scheduling": {
    title: "Construction Scheduling Discipline for Fewer Surprise Delays",
    description: "Improve construction scheduling with dependency-ready planning, look-ahead controls, and escalation rules that keep crews productive and milestones credible.",
    focusAreas: ["readiness criteria by activity", "dependency validation in look-aheads", "delay-cause taxonomy", "recovery plan governance"],
    risks: ["activities released without prerequisites", "material and permit constraints missed", "late escalation of critical constraints", "baseline changes made without decisions"],
    examples: ["inspection sequencing controls", "trade access conflict resolution", "procurement milestone recovery", "public project constraint planning"],
    metrics: ["activities started without readiness confirmation", "look-ahead completion rate", "delay detection-to-escalation time", "milestones with unplanned variance"],
  },
  "construction-project-documentation": {
    title: "Construction Project Documentation Standards That Hold Up Under Pressure",
    description: "Build construction project documentation standards that improve handoffs, reduce disputes, and keep approvals, field updates, and closeout records audit-ready.",
    focusAreas: ["document ownership matrix", "version control consistency", "approval-to-evidence linking", "incremental closeout capture"],
    risks: ["records split across uncontrolled locations", "outdated versions in field circulation", "missing support files for approvals", "closeout package assembly at last minute"],
    examples: ["submittal package tracking", "daily field record quality checks", "claims-ready decision history", "warranty retrieval workflow"],
    metrics: ["missing required records by phase", "version conflicts detected in review", "approval files lacking support evidence", "closeout artifacts completed before final month"],
  },
};

function wordCount(text) {
  return (text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) || []).length;
}

function assertDescription(description, slug) {
  const len = description.length;
  if (len < 80 || len > 200) {
    throw new Error(`Description for ${slug} must be 80-200 chars; got ${len}.`);
  }
}

function list(items, prefix = "-") {
  return items.map((item) => `${prefix} ${item}`).join("\n");
}

function buildFrontmatter({ slug, date }, profile) {
  return `---\ntitle: ${profile.title}\ndescription: ${profile.description}\nslug: ${slug}\ndate: '${date}'\ntags:\n  - buildcore\n  - workflows\n  - construction\napp: buildcore\nrelatedProducts:\n  - buildcore\ndraft: false\npublishDate: '${date}'\n---`;
}

function focusParagraph(topic, focus, risk, example) {
  return `For ${topic}, teams need an explicit operating approach for ${focus}. When that piece stays informal, projects absorb avoidable risk such as ${risk}. A practical way to stabilize execution is to anchor reviews around real scenarios like ${example}, then document the exact decision path and owner commitments after each meeting.`;
}

function buildBody({ topicLabel }, profile) {
  const genericInsights = [
    `Execution quality improves when teams define what done means before work starts. This is especially true in construction where trade coordination, material lead times, and customer decisions all interact on tight windows.`,
    `Most process failures look like communication problems on the surface, but the root issue is usually inconsistent workflow structure. If ownership, timing, or evidence standards are unclear, teams rework the same handoffs every week.`,
    `A steady weekly cadence is more valuable than occasional deep dives. Short action-driven reviews catch drift sooner and reduce surprise escalations.`,
    `Treat each workflow step as a production control. If a step is skipped, document why and what compensating control prevents the same issue from repeating.`,
  ];

  const buildCoreMentions = [
    "BuildCore works well when teams need one connected record for decisions, assignments, and status changes.",
    "By keeping updates in BuildCore, office and field teams can review the same timeline without reconstructing context from separate channels.",
    "BuildCore also helps during weekly coordination because owners and due dates stay visible across departments.",
    "When projects close out, BuildCore keeps documentation accessible for warranty follow-through and future planning.",
  ];

  const focusBlocks = profile.focusAreas
    .map((focus, idx) => focusParagraph(topicLabel, focus, profile.risks[idx % profile.risks.length], profile.examples[idx % profile.examples.length]))
    .join("\n\n");

  const riskDeepDive = profile.risks
    .map((risk, idx) => `${idx + 1}. ${risk}. Teams should define a preventive control and assign one owner to verify it weekly.`)
    .join("\n");

  const exampleDeepDive = profile.examples
    .map((example) => `- ${example}: document the trigger, responsible owner, target date, and completion evidence so the pattern can be reused.`)
    .join("\n");

  const metricDetail = profile.metrics
    .map((metric) => `- ${metric}: review trend and define one corrective action whenever the value moves in the wrong direction for two consecutive cycles.`)
    .join("\n");

  const reusablePlaybook = Array.from({ length: 20 }, (_, idx) => {
    const focus = profile.focusAreas[idx % profile.focusAreas.length];
    const risk = profile.risks[idx % profile.risks.length];
    const example = profile.examples[idx % profile.examples.length];
    return `Playbook note ${idx + 1}: When handling ${focus}, check early for ${risk}. Use examples such as ${example} to train new team members on what complete documentation and accountable follow-through look like in real project conditions.`;
  }).join("\n\n");

  return [
    `Construction teams usually improve ${topicLabel} when they stop relying on memory and build repeatable operational habits. The goal is not extra administration. The goal is faster decisions, clearer handoffs, and fewer avoidable disputes during execution.\n\n${genericInsights[0]}\n\n${genericInsights[1]}`,
    `## Why ${topicLabel} breaks down under real project pressure\n\n${list(profile.risks, "-")}\n\n${genericInsights[2]}\n\n${buildCoreMentions[0]}`,
    `## Core operating model for practical execution\n\n${focusBlocks}\n\n${genericInsights[3]}\n\n${buildCoreMentions[1]}`,
    `## Weekly workflow your team can run without guesswork\n\n${riskDeepDive}\n\nA reliable workflow should include clear ownership, measurable completion criteria, and escalation timing that everyone understands before the week starts.`,
    `## Field and office checklist for consistent handoffs\n\n${list(profile.focusAreas.map((item) => `Confirm process coverage for ${item}`), "-")}\n${list(profile.examples.map((item) => `Validate documentation quality using ${item}`), "-")}\n\n${buildCoreMentions[2]}`,
    `## Practical construction examples to use in team training\n\n${exampleDeepDive}\n\nUse these examples during onboarding and weekly reviews so standards remain consistent when project volume increases.`,
    `## Reporting and metrics that drive decisions\n\n${metricDetail}\n\nMetrics only matter when they trigger action. Keep the set short, review trends weekly, and assign owners for corrective steps.`,
    `## 30-60-90 rollout plan for long-term adoption\n\n- Days 1-30: establish baseline templates, ownership rules, and review cadence.\n- Days 31-60: enforce escalation timing and improve record quality through quick feedback loops.\n- Days 61-90: expand to advanced scenarios and verify consistency across project types.\n\n${buildCoreMentions[3]}\n\n${reusablePlaybook}`,
  ].join("\n\n");
}

async function main() {
  await mkdir(postsDir, { recursive: true });
  const results = [];

  for (const item of schedule) {
    const profile = contentProfiles[item.slug];
    if (!profile) {
      throw new Error(`Missing profile for ${item.slug}`);
    }

    assertDescription(profile.description, item.slug);

    const frontmatter = buildFrontmatter(item, profile);
    const body = buildBody(item, profile);
    const preCtaWordCount = wordCount(body);

    if (preCtaWordCount < 1500) {
      throw new Error(`${item.slug} body has ${preCtaWordCount} words before CTA; expected at least 1500.`);
    }

    const cta = buildProductCtaHtml({ appKey: "buildcore", topicLabel: item.topicLabel });
    const output = `${frontmatter}\n\n${body}\n\n${cta}\n`;
    const filePath = path.resolve(postsDir, `${item.slug}.md`);
    await writeFile(filePath, output, "utf8");

    results.push({ slug: item.slug, filePath, preCtaWordCount });
  }

  for (const result of results) {
    console.log(`${result.slug}.md | ${result.preCtaWordCount} words`);
  }
  console.log(`Wrote ${results.length} markdown files to ${postsDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
