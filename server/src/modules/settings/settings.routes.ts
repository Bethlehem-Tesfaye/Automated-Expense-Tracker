import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as settingsController from "./settings.controller";
import { updateSettingsSchema } from "./settings.schema";

export const settingsRouter = express.Router();

settingsRouter.get("/me", authMiddleware, settingsController.getMySettings);

settingsRouter.put(
  "/me",
  authMiddleware,
  validate(updateSettingsSchema, "body"),
  settingsController.updateMySettings
);
