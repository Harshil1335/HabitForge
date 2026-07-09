import { z } from "zod";

const frequencyTypes = ["DAILY", "WEEKDAYS", "CUSTOM"];

const targetDaysSchema = z
  .array(z.number().int().min(0, "Invalid weekday").max(6, "Invalid weekday"))
  .optional()
  .transform((val) => {
    if (!val) return [];
    // Remove duplicates and sort
    return Array.from(new Set(val)).sort();
  });

export const createHabitSchema = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable(),
  icon: z.string().trim().max(50, "Icon name is too long").default("target"),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g., #10b981)").default("#10b981"),
  frequencyType: z.enum(frequencyTypes).default("DAILY"),
  targetDays: targetDaysSchema,
}).refine(data => {
  if (data.frequencyType === "CUSTOM" && (!data.targetDays || data.targetDays.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "CUSTOM frequency requires at least one target day",
  path: ["targetDays"]
});

export const updateHabitSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name is too long").optional(),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable(),
  icon: z.string().trim().max(50, "Icon name is too long").optional(),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g., #10b981)").optional(),
  frequencyType: z.enum(frequencyTypes).optional(),
  targetDays: targetDaysSchema,
}).refine(data => {
  // If explicitly updating to CUSTOM in this request, and sending empty targetDays, reject.
  if (data.frequencyType === "CUSTOM" && data.targetDays !== undefined && data.targetDays.length === 0) {
    return false;
  }
  return true;
}, {
  message: "CUSTOM frequency requires at least one target day",
  path: ["targetDays"]
}).refine(data => {
  return Object.keys(data).length > 0;
}, {
  message: "At least one field is required to update",
});

export const checkInSchema = z.object({
  timezone: z.string({ required_error: "Timezone is required" }).trim().refine(val => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: val });
      return true;
    } catch (e) {
      return false;
    }
  }, "Invalid IANA timezone"),
});
