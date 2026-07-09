import { achievementService } from "../services/achievementService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

export const getAchievements = asyncHandler(async (req, res) => {
  const data = await achievementService.evaluateAchievements(req.user.id, req.validatedQuery.timezone);
  return ok(res, data);
});

export const getRecentAchievements = asyncHandler(async (req, res) => {
  const data = await achievementService.getRecentAchievements(req.user.id, req.validatedQuery.limit);
  return ok(res, data);
});
