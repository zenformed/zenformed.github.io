export function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {unknown} dateValue
 */
export function normalizeDateIso(dateValue) {
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().slice(0, 10);
  }

  const str = String(dateValue).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const date = new Date(`${str}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return str;
  }

  return date.toISOString().slice(0, 10);
}

/**
 * @param {string} isoDate
 * @param {number} days
 */
export function addDaysToIso(isoDate, days) {
  const date = new Date(`${normalizeDateIso(isoDate)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * @param {object} data
 */
export function isDraftPost(data) {
  return data.draft === true || String(data.draft).toLowerCase() === "true";
}

/**
 * Effective publish date: publishDate when set, otherwise date.
 *
 * @param {object} data
 */
export function getEffectivePublishDate(data) {
  const raw = data.publishDate ?? data.date;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }

  return normalizeDateIso(raw);
}

/**
 * @param {object} data
 * @param {string} [today]
 */
export function isVisiblePost(data, today = getTodayIso()) {
  if (isDraftPost(data)) {
    return false;
  }

  const publishDate = getEffectivePublishDate(data);
  if (!publishDate) {
    return false;
  }

  return publishDate <= today;
}

/**
 * @param {object} data
 * @param {string} [today]
 */
export function isScheduledPost(data, today = getTodayIso()) {
  if (isDraftPost(data)) {
    return false;
  }

  const publishDate = getEffectivePublishDate(data);
  if (!publishDate) {
    return false;
  }

  return publishDate > today;
}
