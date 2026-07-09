import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

// Keep it development friendly but protected
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "development" ? 100 : 10, // 100 requests per 15 min in dev, 10 in prod
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later.",
      code: "TOO_MANY_REQUESTS"
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
