import { AUDIENCE } from "../config.mjs";
import { getTopicKeyword } from "../topics.mjs";
import { countWords as countWordsUtil } from "../utils/text.mjs";

/** @typedef {import("../topics.mjs").BlogTopic} BlogTopic */
/** @typedef {import("./types.mjs").ArticleMetadata} ArticleMetadata */

const SECTION_BLUEPRINTS = [
  {
    title: (_topic, keyword) => `Why ${keyword} breaks down on busy jobs`,
    lead: (topic, keyword) =>
      `Strong ${keyword} rarely fails because teams do not care. It fails because growth adds jobs, people, and handoffs faster than informal tools can track.`,
  },
  {
    title: () => "What contractors get wrong without a system",
    lead: (topic) =>
      `Most contractors already have pieces of ${topic.label.toLowerCase()} spread across texts, shared drives, and accounting exports. The problem is that none of those sources agree on status.`,
  },
  {
    title: () => "Field vs office: where information gets lost",
    lead: (topic) =>
      `Crews optimize for today's work. The office optimizes for billing, scheduling, and customer updates. Without a shared record, both sides make reasonable decisions from incomplete data.`,
  },
  {
    title: (topic, keyword) => `A practical ${keyword} workflow your team can adopt`,
    lead: (topic) =>
      `A workable approach to ${topic.label.toLowerCase()} should fit a Monday morning, not a six-month software rollout. Start with one job type and one clear owner.`,
  },
  {
    title: () => "Checklist: signs you have outgrown spreadsheets",
    lead: (topic) =>
      `Use this checklist during your next production meeting. If three or more items sound familiar, ${topic.label.toLowerCase()} needs a dedicated workflow.`,
  },
  {
    title: () => "How project managers keep jobs moving",
    lead: (topic) =>
      `Project managers do not need more dashboards. They need fewer places to check before answering a customer or committing to a date.`,
  },
  {
    title: () => "Protecting margin while scope changes",
    lead: (topic) =>
      `Margin slips when changes are verbal, approvals are delayed, and costs are recorded after the fact. Tighter ${topic.label.toLowerCase()} connects decisions to dollars earlier.`,
  },
  {
    title: () => "Training the field without slowing production",
    lead: (topic) =>
      `Adoption dies when foremen see software as extra paperwork. Keep capture lightweight and tie it to outcomes crews already care about.`,
  },
  {
    title: (topic, keyword) => `What to implement in the first 30 days for ${keyword}`,
    lead: (topic) =>
      `The first month should focus on consistency, not perfection. Pick the minimum data your team will actually maintain on every active job.`,
  },
];

const PARAGRAPH_EXPANSIONS = [
  (topic, sectionTitle) =>
    `On residential and light commercial work, ${topic.angles[0]} often becomes the first bottleneck. A superintendent assumes the office logged a customer decision. Project coordination assumes the field uploaded photos. By Friday, nobody can reconstruct what was promised on Tuesday.`,
  (topic) =>
    `Teams need one timeline per job for customer communication, internal tasks, documents, and financial checkpoints. That matters because ${topic.summary.toLowerCase()} only works when everyone references the same source of truth.`,
  (topic, sectionTitle) =>
    `Start by naming the trigger events for ${topic.label.toLowerCase()}: new lead, contract signed, mobilization, inspection, substantial completion, final invoice. Each trigger should create a short list of required updates—not optional notes buried in email.`,
  (topic) =>
    `Train for handoffs, not heroics. When a PM is out, another person should open the job record and understand status in under five minutes. That is the bar for useful ${topic.label.toLowerCase()} on construction teams.`,
  (topic) =>
    `Customers notice consistency more than polish. When approvals, schedules, and invoices align, change conversations stay professional. When they do not, contractors spend margin on goodwill repairs.`,
  (topic, sectionTitle) =>
    `Measure leading indicators weekly: open approvals, tasks past due, budget lines without owners, and jobs without a documented next step. Lagging indicators like profit post-mortems are too late to steer active work.`,
  (topic) =>
    `Integrations matter, but discipline matters more. Even the best construction software fails when foremen bypass it because mobile capture takes too long. Design the workflow for a truck cab at 6:45 a.m.`,
  (topic, sectionTitle) =>
    `Document the “done” definition for each phase. For ${topic.angles[1] ?? topic.angles[0]}, done should mean recorded, assigned, and visible—not “handled offline.”`,
];

const BUILDCORE_INSERTS = [
  (topic) =>
    `BuildCore is one example of how contractors keep workflow tasks, approvals, and project documentation tied to the same job record.`,
  (topic) =>
    `A system like BuildCore can make handoffs easier because the next person sees tasks, reminders, and project tracking in one place.`,
  (topic) =>
    `Teams using BuildCore-style reporting often catch open approvals and accountability gaps earlier in the job.`,
];

const CHECKLIST_ITEMS = [
  "Two people give different answers about the same job status",
  "Customer approvals live in text threads without a job link",
  "Change pricing is agreed before it is written down",
  "Weekly production meetings rely on memory instead of records",
  "New hires need shadowing to learn where information lives",
  "Invoices go out before internal teams agree work is complete",
  "Reporting takes hours of copy-paste from multiple tools",
];

/**
 * @param {string} markdown
 */
export function countWords(markdown) {
  return countWordsUtil(markdown);
}

/**
 * @param {BlogTopic} topic
 * @param {ArticleMetadata} metadata
 */
export function buildMockArticleBody(topic, metadata) {
  const keyword = getTopicKeyword(topic);
  const sections = [];

  sections.push(
    `${keyword} is one of the operational gaps that shows up after growth, not before. ${topic.summary} For ${AUDIENCE.industries.join(" and ")}, improving ${topic.label.toLowerCase()} is less about buying software and more about removing silent failure points between the field, the office, and the customer.`,
  );

  for (const [sectionIndex, blueprint] of SECTION_BLUEPRINTS.entries()) {
    const heading =
      typeof blueprint.title === "function"
        ? blueprint.title(topic, keyword)
        : blueprint.title;
    const parts = [`## ${heading}`, "", blueprint.lead(topic, keyword), ""];

    for (let i = 0; i < 4; i += 1) {
      const expander = PARAGRAPH_EXPANSIONS[(i + sectionIndex) % PARAGRAPH_EXPANSIONS.length];
      parts.push(expander(topic, heading), "");
    }

    if (sectionIndex < BUILDCORE_INSERTS.length) {
      parts.push(BUILDCORE_INSERTS[sectionIndex](topic), "");
    }

    if (heading.includes("Checklist")) {
      parts.push(CHECKLIST_ITEMS.map((item) => `- ${item}`).join("\n"), "");
    }

    sections.push(parts.join("\n"));
  }

  sections.push(
    [
      `## Putting ${keyword} into practice on active jobs`,
      "",
      `Pick one active job this week and run ${keyword} end-to-end in a single system. Capture customer decisions, internal tasks, and financial checkpoints in the same timeline.`,
      "",
      `Review with your PM and superintendent on Friday: what was faster, and what rule needs to be simpler? When the workflow is right, a BuildCore-style system can support it without forcing your team into a generic process that ignores inspections, draws, and change events.`,
    ].join("\n"),
  );

  return `${sections.join("\n\n")}\n`;
}
