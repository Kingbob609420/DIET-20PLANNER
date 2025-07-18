import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { generateMealPlan, getNutritionGoals } from "./routes/meal-plan";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Diet planner API routes
  app.post("/api/generate-meal-plan", generateMealPlan);
  app.post("/api/nutrition-goals", getNutritionGoals);

  return app;
}
