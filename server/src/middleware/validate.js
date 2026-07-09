import { badRequest } from "../utils/errors.js";

export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    
    // Improve error message to show which field failed
    const errorMessage = errors[0] ? `${errors[0].path}: ${errors[0].message}` : "Validation failed";
    
    return next(badRequest(errorMessage, "VALIDATION_ERROR"));
  }

  req.body = parsed.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.query);
  
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    
    const errorMessage = errors[0] ? `${errors[0].path}: ${errors[0].message}` : "Validation failed";
    
    return next(badRequest(errorMessage, "VALIDATION_ERROR"));
  }

  req.validatedQuery = parsed.data;
  next();
};
