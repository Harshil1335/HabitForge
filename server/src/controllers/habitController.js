import { habitService } from "../services/habitService.js";
import { checkInService } from "../services/checkInService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { badRequest } from "../utils/errors.js";

export const createHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.createHabit(req.user.id, req.body);
  return created(res, { habit });
});

export const getHabits = asyncHandler(async (req, res) => {
  const { status, timezone } = req.query;

  if (status && !["active", "archived", "all"].includes(status)) {
    throw badRequest("Invalid status filter", "INVALID_FILTER");
  }

  const habits = await habitService.getHabits(req.user.id, { status: status || "active", timezone });
  return ok(res, { habits });
});

export const getHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.getHabitById(req.user.id, req.params.id);
  return ok(res, { habit });
});

export const updateHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.updateHabit(req.user.id, req.params.id, req.body);
  return ok(res, { habit });
});

export const archiveHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.archiveHabit(req.user.id, req.params.id);
  return ok(res, { habit });
});

export const restoreHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.restoreHabit(req.user.id, req.params.id);
  return ok(res, { habit });
});

export const deleteHabit = asyncHandler(async (req, res) => {
  await habitService.deleteHabit(req.user.id, req.params.id);
  return ok(res, null, { message: "Habit deleted successfully" });
});

export const checkInHabit = asyncHandler(async (req, res) => {
  const { timezone } = req.body;
  const checkIn = await checkInService.checkInHabit(req.user.id, req.params.id, timezone);
  return created(res, { checkIn });
});

export const undoCheckIn = asyncHandler(async (req, res) => {
  const { timezone } = req.body;
  await checkInService.undoHabitCheckIn(req.user.id, req.params.id, timezone);
  return ok(res, null, { message: "Check-in undone successfully" });
});
