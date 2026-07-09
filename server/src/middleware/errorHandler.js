import { AppError } from "../utils/errors.js";
import { fail } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error("Error:", err);

  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.message, err.code);
  }

  // Handle generic or unknown errors
  const statusCode = err.status || 500;
  const message = env.NODE_ENV === "development" ? err.message : "Internal Server Error";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  return fail(res, statusCode, message, code);
};
