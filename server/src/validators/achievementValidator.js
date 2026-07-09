import { z } from "zod";

export const achievementQuerySchema = z.object({
  timezone: z.string({
    required_error: "Timezone is required",
    invalid_type_error: "Timezone must be a string",
  }).min(1, "Timezone cannot be empty")
});

export const recentAchievementsQuerySchema = z.object({
  timezone: z.string({
    required_error: "Timezone is required",
    invalid_type_error: "Timezone must be a string",
  }).min(1, "Timezone cannot be empty"),
  limit: z.coerce.number().int().min(1).max(10).default(3)
});
