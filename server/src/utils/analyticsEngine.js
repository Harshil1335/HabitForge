import { 
  weekdayOf, 
  compareDates, 
  addDays, 
  eachPreviousDay, 
  toCalendarDate, 
  isScheduled 
} from "./dates.js";

/**
 * Returns true if the habit was active on the given calendar date.
 */
export function isHabitActiveOnDate(habit, dateStr, timezone) {
  const createdDate = toCalendarDate(habit.createdAt, timezone);
  if (compareDates(dateStr, createdDate) < 0) return false;

  if (habit.archivedAt) {
    const archivedDate = toCalendarDate(habit.archivedAt, timezone);
    if (compareDates(dateStr, archivedDate) > 0) return false;
  }

  return true;
}

/**
 * Calculates scheduled and completed counts for a specific date across an array of habits.
 * @param {Array} habits - List of all habits.
 * @param {Set} checkInSet - Set of `${habitId}_${dateStr}` strings.
 * @param {String} dateStr - The calendar date to check.
 * @param {String} timezone - The timezone.
 */
export function getDayStats(habits, checkInSet, dateStr, timezone) {
  let scheduled = 0;
  let completed = 0;

  for (const habit of habits) {
    if (isHabitActiveOnDate(habit, dateStr, timezone) && isScheduled(habit, dateStr)) {
      scheduled++;
      if (checkInSet.has(`${habit.id}_${dateStr}`)) {
        completed++;
      }
    }
  }

  return { scheduled, completed, dateStr };
}

/**
 * Calculates scheduled and completed counts for a single habit on a specific date.
 */
export function getSingleHabitDayStats(habit, checkInSet, dateStr, timezone) {
  if (isHabitActiveOnDate(habit, dateStr, timezone) && isScheduled(habit, dateStr)) {
    const isCompleted = checkInSet.has(`${habit.id}_${dateStr}`);
    return { scheduled: 1, completed: isCompleted ? 1 : 0 };
  }
  return { scheduled: 0, completed: 0 };
}

/**
 * Common streak calculation logic traversing backward from endDate.
 */
export function calculateStreakBackward(statsProvider, endDate, stopDate) {
  let currentStreak = 0;
  
  for (const dateStr of eachPreviousDay(endDate, stopDate)) {
    const { scheduled, completed } = statsProvider(dateStr);
    
    if (scheduled === 0) {
      // Neutral day
      continue;
    }

    if (completed === scheduled) {
      currentStreak++;
    } else {
      if (dateStr === endDate) {
        // Leniency for today: if it's incomplete, it doesn't break the streak yet.
        continue;
      }
      // Broken streak
      break;
    }
  }

  return currentStreak;
}

/**
 * Common best streak calculation traversing forward.
 */
export function calculateBestStreakForward(statsProvider, startDate, endDate) {
  let bestStreak = 0;
  let currentStreak = 0;
  
  let cur = startDate;
  while (compareDates(cur, endDate) <= 0) {
    const { scheduled, completed } = statsProvider(cur);
    
    if (scheduled > 0) {
      if (completed === scheduled) {
        currentStreak++;
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
      } else {
        if (cur === endDate) {
          // Leniency for today: ignore incomplete
        } else {
          currentStreak = 0;
        }
      }
    }
    
    cur = addDays(cur, 1);
  }

  // Check once more in case it ended on a high note
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return bestStreak;
}

/**
 * Determines completion rate safely.
 */
export function safeCompletionRate(completed, scheduled) {
  if (scheduled === 0) return 0;
  return Math.round((completed / scheduled) * 1000) / 10;
}

/**
 * Returns heatmap level 0-4.
 */
export function getHeatmapLevel(completionRate, scheduled) {
  if (scheduled === 0 || completionRate === 0) return 0;
  if (completionRate < 25) return 1;
  if (completionRate < 50) return 2;
  if (completionRate < 75) return 3;
  return 4;
}
