import { prisma } from "../config/prisma.js";
import { analyticsService } from "./analyticsService.js";
import { achievementEngine } from "../utils/achievementEngine.js";

export const achievementService = {
  /**
   * Evaluate all achievements for a user and return the complete catalog.
   */
  async evaluateAchievements(userId, timezone) {
    // 1. Fetch raw data
    // All habits for the user (including archived, according to Phase 7 semantics)
    const habits = await prisma.habit.findMany({ where: { userId } });
    
    // Total check-ins (Phase 7 check-ins count semantics: all existing check-ins)
    const totalCheckIns = await prisma.habitCheckIn.count({ where: { userId } });
    
    // Analytics: Habit best streaks (we can just use the existing performance endpoint)
    // We pass range "year" or something large? getHabitsPerformance passes null to loadData to load all-time data.
    const perfData = await analyticsService.getHabitsPerformance(userId, { timezone, range: "30d", sort: "highestCompletion" });
    
    // Analytics: Overall best streak
    // getSummary with range "year" still uses all-time for best streak.
    const summaryData = await analyticsService.getSummary(userId, { timezone, range: "30d" });
    
    const overallBestStreak = summaryData.summary.bestStreak;

    // 2. Fetch catalog and current user unlocks
    const catalog = await prisma.achievement.findMany();
    const userUnlocks = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    });
    
    const unlockedSet = new Set(userUnlocks.map(u => u.achievementId));
    const unlockDateMap = new Map(userUnlocks.map(u => [u.achievementId, u.unlockedAt]));

    const newlyUnlockedIds = [];
    const achievementsToPersist = [];
    const responseAchievements = [];

    // 3. Evaluate each achievement
    for (const achievement of catalog) {
      let progress = { current: 0, target: achievement.requirementValue, percentage: 0 };
      
      switch (achievement.requirementType) {
        case 'HABIT_COUNT':
          progress = achievementEngine.evaluateHabitCount(habits, achievement.requirementValue);
          break;
        case 'TOTAL_CHECKINS':
          progress = achievementEngine.evaluateTotalCheckIns(totalCheckIns, achievement.requirementValue);
          break;
        case 'HABIT_BEST_STREAK':
          progress = achievementEngine.evaluateHabitBestStreak(perfData.habits, achievement.requirementValue);
          break;
        case 'OVERALL_BEST_STREAK':
          progress = achievementEngine.evaluateOverallBestStreak(overallBestStreak, achievement.requirementValue);
          break;
      }
      
      const isAlreadyUnlocked = unlockedSet.has(achievement.id);
      let isUnlocked = isAlreadyUnlocked;
      let unlockedAt = unlockDateMap.get(achievement.id) || null;

      // Unlocked items always show 100% progress
      if (isAlreadyUnlocked) {
        progress.percentage = 100;
        progress.current = Math.max(progress.current, progress.target);
      } else {
        if (progress.percentage >= 100) {
          isUnlocked = true;
          unlockedAt = new Date();
          newlyUnlockedIds.push(achievement.id);
          achievementsToPersist.push({
            userId,
            achievementId: achievement.id
            // unlockedAt defaults to now() in DB
          });
        }
      }

      responseAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        requirementType: achievement.requirementType,
        requirementValue: achievement.requirementValue,
        isUnlocked,
        unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
        progress
      });
    }

    // 4. Idempotently persist new unlocks
    if (achievementsToPersist.length > 0) {
      await prisma.userAchievement.createMany({
        data: achievementsToPersist,
        skipDuplicates: true // Safe from concurrent evaluation race conditions
      });
    }

    // Map newly unlocked objects for the response
    const newlyUnlocked = responseAchievements.filter(a => newlyUnlockedIds.includes(a.id));

    // Summary calculations
    const total = responseAchievements.length;
    const unlockedCount = responseAchievements.filter(a => a.isUnlocked).length;
    
    // Sort unlocked to find latest
    const unlockedResponse = responseAchievements.filter(a => a.isUnlocked).sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    const latestAchievement = unlockedResponse.length > 0 ? {
      id: unlockedResponse[0].id,
      name: unlockedResponse[0].name,
      icon: unlockedResponse[0].icon,
      unlockedAt: unlockedResponse[0].unlockedAt
    } : null;

    return {
      summary: {
        total,
        unlocked: unlockedCount,
        locked: total - unlockedCount,
        completionPercentage: total === 0 ? 0 : Math.round((unlockedCount / total) * 1000) / 10,
        latestAchievement
      },
      achievements: responseAchievements,
      newlyUnlocked
    };
  },

  /**
   * Fetch recent unlocked achievements for the dashboard.
   */
  async getRecentAchievements(userId, limit = 3) {
    const recent = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      take: limit,
      include: { achievement: true }
    });

    return {
      achievements: recent.map(r => ({
        id: r.achievement.id,
        name: r.achievement.name,
        description: r.achievement.description,
        icon: r.achievement.icon,
        unlockedAt: r.unlockedAt.toISOString()
      }))
    };
  }
};
