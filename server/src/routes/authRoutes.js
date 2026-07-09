import { Router } from "express";
import { register, login, me, updateProfile, changePassword } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/authValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/authRateLimiter.js";

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, validate(updateProfileSchema), updateProfile);
router.put("/change-password", requireAuth, validate(changePasswordSchema), changePassword);

export { router as authRoutes };
