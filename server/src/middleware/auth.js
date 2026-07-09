import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/errors.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(unauthorized("Missing or invalid authorization header", "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(unauthorized("Missing or invalid authorization header", "UNAUTHORIZED"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach identity to the request
    req.user = {
      id: decoded.id,
    };
    
    next();
  } catch (error) {
    // Don't leak JWT errors to the client
    return next(unauthorized("Invalid or expired token", "UNAUTHORIZED"));
  }
};
