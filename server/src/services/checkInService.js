import { prisma } from "../config/prisma.js";
import { notFound, badRequest, conflict } from "../utils/errors.js";
import { todayCalendarDate, isScheduled } from "../utils/dates.js";
import { habitService } from "./habitService.js";

export const checkInService = {
  async checkInHabit(userId, habitId, timezone) {
    // 1. Get the habit & verify ownership
    const habit = await habitService.getHabitById(userId, habitId);

    // 2. Cannot check in to archived habits
    if (habit.archivedAt) {
      throw badRequest("Cannot check in to an archived habit", "HABIT_ARCHIVED");
    }

    // 3. Determine the local calendar date
    const dateStr = todayCalendarDate(timezone);

    // 4. Verify it's scheduled for this date
    if (!isScheduled(habit, dateStr)) {
      throw badRequest("Habit is not scheduled for today", "HABIT_NOT_SCHEDULED");
    }

    // 5. Create the check-in (Prisma expects a Date object for @db.Date, best to use UTC midnight)
    const checkInDate = new Date(`${dateStr}T00:00:00Z`);

    try {
      const checkIn = await prisma.habitCheckIn.create({
        data: {
          habitId,
          userId,
          checkInDate,
        },
      });
      return checkIn;
    } catch (error) {
      // Handle Prisma unique constraint violation (P2002) for duplicate check-ins
      if (error.code === "P2002") {
        throw conflict("Habit is already checked in for today", "DUPLICATE_CHECKIN");
      }
      throw error;
    }
  },

  async undoHabitCheckIn(userId, habitId, timezone) {
    // 1. Verify ownership via habit
    await habitService.getHabitById(userId, habitId);

    // 2. Determine local calendar date
    const dateStr = todayCalendarDate(timezone);
    const checkInDate = new Date(`${dateStr}T00:00:00Z`);

    // 3. Find and delete the check-in if it exists
    try {
      // Since habitId + checkInDate is a unique constraint, we can delete by unique composite key.
      // But we also need to enforce userId ownership, though it's already enforced because
      // the habit is owned by the user, and checkIn is tied to habit.
      
      const checkIn = await prisma.habitCheckIn.findUnique({
        where: {
          habitId_checkInDate: {
            habitId,
            checkInDate,
          }
        }
      });

      if (!checkIn || checkIn.userId !== userId) {
        throw notFound("Check-in not found for today", "CHECKIN_NOT_FOUND");
      }

      await prisma.habitCheckIn.delete({
        where: { id: checkIn.id }
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};
