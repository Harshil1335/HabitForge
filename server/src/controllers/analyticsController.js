import { analyticsService } from "../services/analyticsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

export const getSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSummary(req.user.id, req.validatedQuery);
  return ok(res, data);
});

export const getContributions = asyncHandler(async (req, res) => {
  const data = await analyticsService.getContributions(req.user.id, req.validatedQuery);
  return ok(res, data);
});

export const getWeeklyOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getWeeklyOverview(req.user.id, req.validatedQuery);
  return ok(res, data);
});

export const getHabitPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getHabitsPerformance(req.user.id, req.validatedQuery);
  return ok(res, data);
});

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardAnalytics(req.user.id, req.validatedQuery);
  return ok(res, data);
});

export const getTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTrend(req.user.id, req.validatedQuery);
  return ok(res, data);
});

export const getInsights = asyncHandler(async (req, res) => {
  const data = await analyticsService.getInsights(req.user.id, req.validatedQuery);
  return ok(res, data);
});
