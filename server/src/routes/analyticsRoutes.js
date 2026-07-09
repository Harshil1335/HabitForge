import { Router } from "express";
import { 
  getSummary,
  getContributions,
  getWeeklyOverview,
  getHabitPerformance,
  getDashboardAnalytics,
  getTrend,
  getInsights
} from "../controllers/analyticsController.js";
import { validateQuery } from "../middleware/validate.js";
import { analyticsQuerySchema } from "../validators/analyticsValidator.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", validateQuery(analyticsQuerySchema), getSummary);
router.get("/contributions", validateQuery(analyticsQuerySchema), getContributions);
router.get("/weekly", validateQuery(analyticsQuerySchema), getWeeklyOverview);
router.get("/habits", validateQuery(analyticsQuerySchema), getHabitPerformance);
router.get("/dashboard", validateQuery(analyticsQuerySchema), getDashboardAnalytics);
router.get("/trend", validateQuery(analyticsQuerySchema), getTrend);
router.get("/insights", validateQuery(analyticsQuerySchema), getInsights);

export { router as analyticsRoutes };
