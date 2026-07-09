import { Router } from "express";
import { 
  createHabit, 
  getHabits, 
  getHabit, 
  updateHabit, 
  archiveHabit, 
  restoreHabit,
  deleteHabit, 
  checkInHabit, 
  undoCheckIn 
} from "../controllers/habitController.js";
import { validate } from "../middleware/validate.js";
import { createHabitSchema, updateHabitSchema, checkInSchema } from "../validators/habitValidator.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All habit routes require authentication
router.use(requireAuth);

router.post("/", validate(createHabitSchema), createHabit);
router.get("/", getHabits);
router.get("/:id", getHabit);
router.put("/:id", validate(updateHabitSchema), updateHabit);
router.patch("/:id/archive", archiveHabit);
router.patch("/:id/restore", restoreHabit);
router.delete("/:id", deleteHabit);

router.post("/:id/checkin", validate(checkInSchema), checkInHabit);
router.delete("/:id/checkin", validate(checkInSchema), undoCheckIn);

export { router as habitRoutes };
