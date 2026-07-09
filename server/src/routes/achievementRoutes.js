import { Router } from "express";
import { 
  getAchievements,
  getRecentAchievements
} from "../controllers/achievementController.js";
import { validateQuery } from "../middleware/validate.js";
import { 
  achievementQuerySchema,
  recentAchievementsQuerySchema
} from "../validators/achievementValidator.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/recent", validateQuery(recentAchievementsQuerySchema), getRecentAchievements);
router.get("/", validateQuery(achievementQuerySchema), getAchievements);

export { router as achievementRoutes };
