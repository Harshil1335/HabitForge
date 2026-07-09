// Typed application errors. Never leak internal details to clients.
export class AppError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export const badRequest = (msg = "Bad request", code = "BAD_REQUEST") =>
  new AppError(400, msg, code);
export const unauthorized = (msg = "Unauthorized", code = "UNAUTHORIZED") =>
  new AppError(401, msg, code);
export const forbidden = (msg = "Forbidden", code = "FORBIDDEN") =>
  new AppError(403, msg, code);
export const notFound = (msg = "Not found", code = "NOT_FOUND") =>
  new AppError(404, msg, code);
export const conflict = (msg = "Conflict", code = "CONFLICT") =>
  new AppError(409, msg, code);
