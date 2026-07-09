import { prisma } from "../config/prisma.js";
import { notFound, badRequest } from "../utils/errors.js";
import { todayCalendarDate } from "../utils/dates.js";

// Helper to normalize targetDays consistently
const normalizeTargetDays = (frequencyType, targetDays) => {
  if (frequencyType === "DAILY") {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  if (frequencyType === "WEEKDAYS") {
    return [1, 2, 3, 4, 5];
  }
  return targetDays || [];
};

export const habitService = {
  async createHabit(userId, data) {
    const { name, description, icon, color, frequencyType, targetDays } = data;

    const normalizedDays = normalizeTargetDays(frequencyType, targetDays);

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        description,
        icon,
        color,
        frequencyType,
        targetDays: normalizedDays,
      },
    });

    return habit;
  },

  async getHabits(userId, { status = "active", timezone } = {}) {
    let whereClause = { userId };

    if (status === "active") {
      whereClause.archivedAt = null;
    } else if (status === "archived") {
      whereClause.archivedAt = { not: null };
    } else if (status !== "all") {
      // Handled by validation in controller or fallback to all
    }

    const habits = await prisma.habit.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (timezone) {
      const dateStr = todayCalendarDate(timezone);
      const checkInDate = new Date(`${dateStr}T00:00:00Z`);

      const todayCheckIns = await prisma.habitCheckIn.findMany({
        where: {
          userId,
          checkInDate,
          habitId: { in: habits.map(h => h.id) },
        },
        select: { habitId: true },
      });

      const checkedInSet = new Set(todayCheckIns.map(c => c.habitId));

      return habits.map(habit => ({
        ...habit,
        isCheckedInToday: checkedInSet.has(habit.id),
      }));
    }

    return habits;
  },

  async getHabitById(userId, habitId) {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit || habit.userId !== userId) {
      throw notFound("Habit not found", "HABIT_NOT_FOUND");
    }

    return habit;
  },

  async updateHabit(userId, habitId, data) {
    // Verify ownership first
    const existing = await this.getHabitById(userId, habitId);

    // Determine new frequency configuration
    const newFreqType = data.frequencyType || existing.frequencyType;
    let newTargetDays = data.targetDays !== undefined ? data.targetDays : (existing.targetDays || []);

    // Re-normalize if freq type or target days changed
    if (data.frequencyType || data.targetDays !== undefined) {
      newTargetDays = normalizeTargetDays(newFreqType, newTargetDays);
      
      // Secondary validation check if updating just one field resulted in invalid state
      if (newFreqType === "CUSTOM" && newTargetDays.length === 0) {
        throw badRequest("CUSTOM frequency requires at least one target day", "INVALID_FREQUENCY");
      }
    }

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        frequencyType: newFreqType,
        targetDays: newTargetDays,
      },
    });

    return habit;
  },

  async archiveHabit(userId, habitId) {
    // Verify ownership
    await this.getHabitById(userId, habitId);

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: { archivedAt: new Date() },
    });

    return habit;
  },

  async restoreHabit(userId, habitId) {
    // Verify ownership
    await this.getHabitById(userId, habitId);

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: { archivedAt: null },
    });

    return habit;
  },

  async deleteHabit(userId, habitId) {
    // Verify ownership
    await this.getHabitById(userId, habitId);

    await prisma.habit.delete({
      where: { id: habitId },
    });

    return { success: true };
  },
};
