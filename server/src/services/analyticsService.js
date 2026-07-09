import { prisma } from "../config/prisma.js";
import { 
  todayCalendarDate, 
  addDays, 
  dateRange,
  weekdayOf,
  compareDates
} from "../utils/dates.js";
import {
  isHabitActiveOnDate,
  getDayStats,
  getSingleHabitDayStats,
  calculateStreakBackward,
  calculateBestStreakForward,
  safeCompletionRate,
  getHeatmapLevel
} from "../utils/analyticsEngine.js";

// Helper to get start and end dates based on range semantics
const getRangeDates = (range, timezone) => {
  const endDate = todayCalendarDate(timezone);
  let startDate;

  if (range === "7d") {
    startDate = addDays(endDate, -6);
  } else if (range === "90d") {
    startDate = addDays(endDate, -89);
  } else if (range === "year") {
    const year = endDate.slice(0, 4);
    startDate = `${year}-01-01`;
  } else {
    // default 30d
    startDate = addDays(endDate, -29);
  }
  return { startDate, endDate };
};

// Data loader to avoid multiple DB hits per request
const loadData = async (userId, startDate, endDate) => {
  const habits = await prisma.habit.findMany({ where: { userId } });
  
  // We only really need check-ins for active habits, but fetching all for user is fine.
  // We don't bound check-ins by startDate because Best Streak and Current Streak might 
  // extend far before startDate. We fetch all for accurate streak calculation.
  const checkIns = await prisma.habitCheckIn.findMany({
    where: { userId },
    select: { habitId: true, checkInDate: true }
  });

  const checkInSet = new Set(
    checkIns.map(c => `${c.habitId}_${c.checkInDate.toISOString().slice(0, 10)}`)
  );

  return { habits, checkInSet };
};

export const analyticsService = {
  async getSummary(userId, { timezone, range = "30d" }) {
    const { startDate, endDate } = getRangeDates(range, timezone);
    const { habits, checkInSet } = await loadData(userId, startDate, endDate);

    const activeHabitsList = habits.filter(h => isHabitActiveOnDate(h, endDate, timezone));
    const activeHabits = activeHabitsList.length;

    let totalScheduled = 0;
    let totalCompleted = 0;
    let totalCheckIns = 0;

    const dates = dateRange(startDate, endDate);
    for (const dateStr of dates) {
      const stats = getDayStats(habits, checkInSet, dateStr, timezone);
      totalScheduled += stats.scheduled;
      totalCompleted += stats.completed;
      totalCheckIns += stats.completed;
    }

    const todayStats = getDayStats(habits, checkInSet, endDate, timezone);

    // Overall best streak requires earliestDate
    let earliestDate = endDate;
    for (const h of habits) {
      const created = h.createdAt.toISOString().slice(0, 10);
      if (created < earliestDate) earliestDate = created;
    }

    // Instead of account-wide perfect days (which are extremely rare), 
    // the summary streak should represent the user's highest individual habit streak.
    let maxCurrentStreak = 0;
    let maxBestStreak = 0;
    let maxCurrentStreakHabit = '';
    let maxBestStreakHabit = '';

    for (const habit of habits) {
      const createdDate = habit.createdAt.toISOString().slice(0, 10);
      
      const currentStreak = calculateStreakBackward(
        (dateStr) => getSingleHabitDayStats(habit, checkInSet, dateStr, timezone),
        endDate,
        createdDate
      );

      const bestStreak = calculateBestStreakForward(
        (dateStr) => getSingleHabitDayStats(habit, checkInSet, dateStr, timezone),
        createdDate,
        endDate
      );

      if (currentStreak > maxCurrentStreak) {
        maxCurrentStreak = currentStreak;
        maxCurrentStreakHabit = habit.name;
      }
      if (bestStreak > maxBestStreak) {
        maxBestStreak = bestStreak;
        maxBestStreakHabit = habit.name;
      }
    }

    return {
      summary: {
        currentStreak: maxCurrentStreak,
        currentStreakHabit: maxCurrentStreakHabit,
        bestStreak: maxBestStreak,
        bestStreakHabit: maxBestStreakHabit,
        completionRate: safeCompletionRate(totalCompleted, totalScheduled),
        totalCheckIns,
        completedToday: todayStats.completed,
        scheduledToday: todayStats.scheduled,
        activeHabits
      },
      range: {
        key: range,
        startDate,
        endDate
      }
    };
  },

  async getContributions(userId, { timezone, year }) {
    const localYear = year || parseInt(todayCalendarDate(timezone).slice(0, 4), 10);
    const { habits, checkInSet } = await loadData(userId, null, null); // all-time data

    const startDate = `${localYear}-01-01`;
    const endDate = `${localYear}-12-31`;
    const dates = dateRange(startDate, endDate);
    const today = todayCalendarDate(timezone);

    const contributions = dates.map(dateStr => {
      // Future dates should be 0 level
      if (dateStr > today) {
        return { date: dateStr, scheduled: 0, completed: 0, completionRate: 0, level: 0 };
      }
      const stats = getDayStats(habits, checkInSet, dateStr, timezone);
      const rate = safeCompletionRate(stats.completed, stats.scheduled);
      const level = getHeatmapLevel(rate, stats.scheduled);
      
      return {
        date: dateStr,
        scheduled: stats.scheduled,
        completed: stats.completed,
        completionRate: rate,
        level
      };
    });

    return { year: localYear, contributions };
  },

  async getWeeklyOverview(userId, { timezone }) {
    const today = todayCalendarDate(timezone);
    const dow = weekdayOf(today); 
    // Dow: 0=Sun, 1=Mon, ..., 6=Sat
    // Make Monday=0, Sunday=6
    const daysSinceMonday = dow === 0 ? 6 : dow - 1;
    
    const weekStart = addDays(today, -daysSinceMonday);
    const weekEnd = addDays(weekStart, 6);
    const dates = dateRange(weekStart, weekEnd);

    const { habits, checkInSet } = await loadData(userId, null, null);
    
    const wdNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = dates.map(dateStr => {
      if (dateStr > today) {
        return {
          date: dateStr,
          weekday: wdNames[weekdayOf(dateStr)],
          scheduled: 0,
          completed: 0,
          completionRate: 0
        };
      }
      
      const stats = getDayStats(habits, checkInSet, dateStr, timezone);
      return {
        date: dateStr,
        weekday: wdNames[weekdayOf(dateStr)],
        scheduled: stats.scheduled,
        completed: stats.completed,
        completionRate: safeCompletionRate(stats.completed, stats.scheduled)
      };
    });

    return { weekStart, weekEnd, days };
  },

  async getHabitsPerformance(userId, { timezone, range = "30d", sort = "highestCompletion" }) {
    const { startDate, endDate } = getRangeDates(range, timezone);
    const { habits, checkInSet } = await loadData(userId, null, null);

    const habitPerformances = [];

    for (const habit of habits) {
      // Must have been active at some point during the range
      if (habit.archivedAt && habit.archivedAt.toISOString().slice(0, 10) < startDate) continue;
      if (habit.createdAt.toISOString().slice(0, 10) > endDate) continue;

      let scheduled = 0;
      let completed = 0;
      for (const dateStr of dateRange(startDate, endDate)) {
        const stats = getSingleHabitDayStats(habit, checkInSet, dateStr, timezone);
        scheduled += stats.scheduled;
        completed += stats.completed;
      }

      // If it wasn't scheduled at all during this range, skip it if you want, 
      // but let's include it if it was active.
      if (scheduled === 0 && !isHabitActiveOnDate(habit, endDate, timezone)) {
         continue; // Archived and never scheduled in range
      }

      const createdDate = habit.createdAt.toISOString().slice(0, 10);
      
      const currentStreak = calculateStreakBackward(
        (dateStr) => getSingleHabitDayStats(habit, checkInSet, dateStr, timezone),
        endDate,
        createdDate
      );

      const bestStreak = calculateBestStreakForward(
        (dateStr) => getSingleHabitDayStats(habit, checkInSet, dateStr, timezone),
        createdDate,
        endDate
      );

      habitPerformances.push({
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        frequencyType: habit.frequencyType,
        targetDays: habit.targetDays || [],
        scheduledOpportunities: scheduled,
        completedCheckIns: completed,
        completionRate: safeCompletionRate(completed, scheduled),
        currentStreak,
        bestStreak,
        isActive: !habit.archivedAt
      });
    }

    if (sort === "lowestCompletion") {
      habitPerformances.sort((a, b) => a.completionRate - b.completionRate);
    } else if (sort === "longestStreak") {
      habitPerformances.sort((a, b) => b.currentStreak - a.currentStreak);
    } else {
      habitPerformances.sort((a, b) => b.completionRate - a.completionRate);
    }

    return { habits: habitPerformances, range: { key: range, startDate, endDate } };
  },

  async getDashboardAnalytics(userId, { timezone }) {
    // A composite endpoint
    const summaryData = await this.getSummary(userId, { timezone, range: "year" });
    const contributionsData = await this.getContributions(userId, { timezone, year: null });
    const weeklyData = await this.getWeeklyOverview(userId, { timezone });
    
    // Top streaks using all-time data but we can just use getHabitsPerformance
    const perfData = await this.getHabitsPerformance(userId, { timezone, range: "30d", sort: "longestStreak" });
    
    const topStreaks = perfData.habits
      .filter(h => h.isActive) // only active
      .sort((a, b) => {
        if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
        if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3)
      .map(h => ({
        name: h.name,
        color: h.color,
        streak: h.currentStreak,
        bestStreak: h.bestStreak
      }));

    return {
      summary: summaryData.summary,
      contributions: contributionsData.contributions,
      weekly: weeklyData,
      topStreaks,
      habitPerformances: perfData.habits
    };
  },

  async getTrend(userId, { timezone, range = "30d" }) {
    const { startDate, endDate } = getRangeDates(range, timezone);
    const { habits, checkInSet } = await loadData(userId, startDate, endDate);
    
    let granularity = "day";
    if (range === "90d") granularity = "week";
    if (range === "year") granularity = "month";

    const points = [];
    let currentBucketStart = startDate;

    const nextBucketStart = (dateStr) => {
      if (granularity === "day") return addDays(dateStr, 1);
      if (granularity === "week") return addDays(dateStr, 7);
      if (granularity === "month") {
        // approximate 30 days or proper month boundary? 
        // Using strict month boundary:
        const d = new Date(`${dateStr}T12:00:00Z`);
        d.setUTCMonth(d.getUTCMonth() + 1);
        d.setUTCDate(1);
        return d.toISOString().slice(0, 10);
      }
    };

    const formatLabel = (dateStr) => {
      const d = new Date(`${dateStr}T12:00:00Z`);
      if (granularity === "day") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (granularity === "week") return "Week of " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (granularity === "month") return d.toLocaleDateString("en-US", { month: "short" });
    };

    while (compareDates(currentBucketStart, endDate) <= 0) {
      let bucketEnd = addDays(nextBucketStart(currentBucketStart), -1);
      if (compareDates(bucketEnd, endDate) > 0) bucketEnd = endDate;

      let scheduled = 0;
      let completed = 0;
      for (const d of dateRange(currentBucketStart, bucketEnd)) {
        const stats = getDayStats(habits, checkInSet, d, timezone);
        scheduled += stats.scheduled;
        completed += stats.completed;
      }

      points.push({
        label: formatLabel(currentBucketStart),
        startDate: currentBucketStart,
        endDate: bucketEnd,
        scheduled,
        completed,
        completionRate: safeCompletionRate(completed, scheduled)
      });

      currentBucketStart = addDays(bucketEnd, 1);
    }

    return { range: { key: range, startDate, endDate }, granularity, points };
  },

  async getInsights(userId, { timezone, range = "30d" }) {
    const perfData = await this.getHabitsPerformance(userId, { timezone, range, sort: "highestCompletion" });
    
    if (perfData.habits.length === 0) {
      return { insights: [{ title: "No data", description: "More insights will appear as you build your habit history." }] };
    }

    const insights = [];
    
    const active = perfData.habits.filter(h => h.scheduledOpportunities > 0);
    
    if (active.length > 0) {
      const best = active.reduce((prev, curr) => (prev.completionRate > curr.completionRate ? prev : curr));
      if (best.completionRate > 0) {
        insights.push({
          title: "Most consistent habit",
          description: `You're crushing it with "${best.name}" at a ${best.completionRate}% completion rate.`
        });
      }
      
      const worst = active.reduce((prev, curr) => (prev.completionRate < curr.completionRate ? prev : curr));
      if (worst.completionRate < 50 && best.id !== worst.id) {
        insights.push({
          title: "Needs attention",
          description: `"${worst.name}" has slipped to ${worst.completionRate}%. Try adjusting your schedule if it's too difficult.`
        });
      }
    }

    if (insights.length === 0) {
      insights.push({ title: "Keep it up", description: "More insights will appear as you build your habit history." });
    }

    return { insights };
  }
};
