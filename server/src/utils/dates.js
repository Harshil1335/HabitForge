// Calendar-date utilities. All streak/heatmap logic operates on calendar dates,
// never on raw timestamps minus 24h. A "calendar date" is a YYYY-MM-DD string.

const formatters = new Map();

function getFormatter(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(timeZone, new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }));
  }
  return formatters.get(timeZone);
}

/**
 * Convert a Date/timestamp to the user's local calendar date (YYYY-MM-DD),
 * using the IANA timezone the client reports. en-CA locale yields ISO order.
 */
export function toCalendarDate(ts, timeZone = "UTC") {
  const d = ts instanceof Date ? ts : new Date(ts);
  return getFormatter(timeZone).format(d);
}

/** Today's calendar date (YYYY-MM-DD) in the given timezone. */
export function todayCalendarDate(timeZone = "UTC") {
  return toCalendarDate(new Date(), timeZone);
}

/** Weekday index 0..6 (Sun..Sat) for a YYYY-MM-DD string, tz-agnostic. */
export function weekdayOf(dateStr) {
  // Parse as UTC noon to avoid DST edge shifting the day.
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

/** True if a habit is scheduled on the given calendar date. */
export function isScheduled(habit, dateStr) {
  const dow = weekdayOf(dateStr);
  switch (habit.frequencyType) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return dow >= 1 && dow <= 5; // Mon..Fri
    case "CUSTOM": {
      const days = Array.isArray(habit.targetDays) ? habit.targetDays : [];
      return days.includes(dow);
    }
    default:
      return false;
  }
}

/** Compare two YYYY-MM-DD strings: -1, 0, 1. */
export function compareDates(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sameDay(a, b) {
  return a === b;
}

/** The calendar date N days before dateStr (YYYY-MM-DD). */
export function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Generator over previous calendar days starting at `fromDate` (inclusive),
 * walking backwards. Yields YYYY-MM-DD strings.
 * Stops if it passes `stopDate` (inclusive).
 */
export function* eachPreviousDay(fromDate, stopDate) {
  let cur = fromDate;
  while (true) {
    if (stopDate && compareDates(cur, stopDate) < 0) break;
    yield cur;
    cur = addDays(cur, -1);
  }
}

/** Inclusive list of calendar dates from `start` to `end` (YYYY-MM-DD, ascending). */
export function dateRange(start, end) {
  const out = [];
  let cur = start;
  while (compareDates(cur, end) <= 0) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
