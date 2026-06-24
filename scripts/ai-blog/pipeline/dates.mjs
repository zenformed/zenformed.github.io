export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {string} isoDate
 * @param {number} days
 */
export function addDaysToIsoDate(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
