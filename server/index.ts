import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleNewsAlerts } from "./routes/news";
import {
  handleGetRequests,
  handleCreateRequest,
  handleUpdateRequest,
  handleGetMetrics,
} from "./routes/requests";
import {
  handleGetAchievements,
  handleAchievementsMetrics,
  handleCreateAchievement,
} from "./routes/achievements";
import {
  handleGetUsers,
  handleAddUser,
  handleRemoveUser,
} from "./routes/users";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // News alerts proxy
  app.get("/api/news/alerts", handleNewsAlerts);

  // Requests endpoints
  app.get("/api/requests", handleGetRequests);
  app.post("/api/requests", handleCreateRequest);
  app.put("/api/requests/:id", handleUpdateRequest);
  app.get("/api/metrics", handleGetMetrics);

  // Achievements endpoints
  app.get("/api/achievements", handleGetAchievements);
  app.get("/api/achievements/metrics", handleAchievementsMetrics);

  // Users endpoints
  app.get("/api/users", handleGetUsers);
  app.post("/api/users", handleAddUser);
  app.delete("/api/users/:id", handleRemoveUser);

  return app;
}
