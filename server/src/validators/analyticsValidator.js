import { z } from "zod";

export const analyticsQuerySchema = z.object({
  timezone: z.string({
    required_error: "Timezone is required",
  }),
  range: z.enum(["7d", "30d", "90d", "year"]).optional().default("30d"),
  sort: z.enum(["highestCompletion", "lowestCompletion", "longestStreak"]).optional().default("highestCompletion"),
  year: z.string().regex(/^\d{4}$/, "Invalid year format").optional()
    .transform(val => val ? parseInt(val, 10) : undefined)
});
