import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as dashboardController from "./dashboard.controller";
import { dashboardOverviewQuerySchema } from "./dashboard.schema";

export const dashboardRouter = express.Router();

dashboardRouter.get(
  "/overview",
  authMiddleware,
  validate(dashboardOverviewQuerySchema, "query"),
  dashboardController.getDashboardOverview
);
