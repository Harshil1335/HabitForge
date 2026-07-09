/**
 * Schedule utility for frontend.
 */

/**
 * Returns the weekday (0-6) of the current date in the specified timezone.
 */
export const getLocalWeekday = (timezone) => {
  const d = new Date();
  
  // Format the date using the specified timezone to get the weekday part.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });
  
  const weekdayStr = formatter.format(d); // e.g., 'Mon'
  
  const days = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };
  
  return days[weekdayStr] ?? d.getDay();
};

/**
 * Checks if a habit is scheduled for today in the given timezone.
 */
export const isScheduledToday = (habit, timezone) => {
  const dow = getLocalWeekday(timezone);
  
  switch (habit.frequencyType) {
    case 'DAILY':
      return true;
    case 'WEEKDAYS':
      return dow >= 1 && dow <= 5;
    case 'CUSTOM': {
      const days = Array.isArray(habit.targetDays) ? habit.targetDays : [];
      return days.includes(dow);
    }
    default:
      return false;
  }
};
