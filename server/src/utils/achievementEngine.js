import { isHabitActiveOnDate } from "./analyticsEngine.js";

/**
 * Normalizes progress to avoid NaN, Infinity, and caps percentage at 100%.
 */
export function normalizeProgress(current, target) {
  const safeCurrent = Math.max(0, current);
  const safeTarget = Math.max(1, target); // Avoid divide by zero
  const rawPercentage = (safeCurrent / safeTarget) * 100;
  
  return {
    current: safeCurrent,
    target: safeTarget,
    percentage: Math.min(100, Math.round(rawPercentage * 10) / 10)
  };
}

/**
 * Engine to evaluate all possible achievement types.
 * Pure logic only. No Prisma calls here.
 */
export const achievementEngine = {
  
  evaluateHabitCount(habits, target) {
    // Phase 7 Semantics: Count all existing Habits in the database (even archived).
    const count = habits.length;
    return normalizeProgress(count, target);
  },
  
  evaluateTotalCheckIns(checkInsCount, target) {
    // Phase 7 Semantics: All existing HabitCheckIn rows owned by the user.
    return normalizeProgress(checkInsCount, target);
  },
  
  evaluateHabitBestStreak(habitPerformances, target) {
    // We already have `bestStreak` computed by getHabitsPerformance for each habit.
    // So we just take the max `bestStreak` among all habits.
    let maxStreak = 0;
    for (const h of habitPerformances) {
      if (h.bestStreak && h.bestStreak > maxStreak) {
        maxStreak = h.bestStreak;
      }
    }
    return normalizeProgress(maxStreak, target);
  },
  
  evaluateOverallBestStreak(overallBestStreak, target) {
    // Phase 7 Semantics: Perfect Week uses overallBestStreak from getSummary analytics.
    return normalizeProgress(overallBestStreak, target);
  }
};
