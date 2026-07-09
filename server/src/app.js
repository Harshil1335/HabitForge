import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./utils/errors.js";
import { authRoutes } from "./routes/authRoutes.js";
import { habitRoutes } from "./routes/habitRoutes.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { achievementRoutes } from "./routes/achievementRoutes.js";

const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middleware
app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HabitForge API is running",
    data: {
      environment: env.NODE_ENV,
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/achievements", achievementRoutes);

// 404 Handler for unknown routes
app.use((req, res, next) => {
  next(notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// Centralized Error Handling
app.use(errorHandler);

export { app };
