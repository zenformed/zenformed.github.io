import { BLOG_TOPICS, getTopicById, listTopicIds } from "../topics.mjs";

/**
 * @param {number} count
 * @param {object} [options]
 * @param {string} [options.topicId]
 * @param {string[]} [options.excludeTopicIds]
 */
export function resolveTopics(count, options = {}) {
  if (options.topicId) {
    const topic = getTopicById(options.topicId);

    if (!topic) {
      throw new Error(
        `Unknown topic "${options.topicId}". Valid topic IDs: ${listTopicIds().join(", ")}`,
      );
    }

    return Array.from({ length: count }, () => topic);
  }

  return selectTopics(count, options);
}

/**
 * @param {number} count
 * @param {object} [options]
 * @param {string[]} [options.excludeTopicIds]
 */
export function selectTopics(count, options = {}) {
  const exclude = new Set(options.excludeTopicIds ?? []);
  const pool = BLOG_TOPICS.filter((topic) => !exclude.has(topic.id));

  if (pool.length === 0) {
    throw new Error("No topics available for generation.");
  }

  const shuffled = shuffle([...pool]);
  const selected = [];

  for (let i = 0; i < count; i += 1) {
    selected.push(shuffled[i % shuffled.length]);
  }

  return selected;
}

/**
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
