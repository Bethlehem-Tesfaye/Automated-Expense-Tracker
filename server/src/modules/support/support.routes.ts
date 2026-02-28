import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import supportAdminMiddleware from "../../middleware/supportAdmin.middleware";
import { validate } from "../../middleware/validate";
import * as supportController from "./support.controller";
import {
  adminSupportRequestsQuerySchema,
  createSupportRequestSchema,
  getSupportRequestsQuerySchema,
  supportRequestIdParamSchema,
  updateSupportRequestStatusSchema
} from "./support.schema";

export const supportRouter = express.Router();

supportRouter.get(
  "/resources",
  authMiddleware,
  supportController.getSupportResources
);

supportRouter.get(
  "/requests",
  authMiddleware,
  validate(getSupportRequestsQuerySchema, "query"),
  supportController.getSupportRequests
);

supportRouter.post(
  "/requests",
  authMiddleware,
  validate(createSupportRequestSchema, "body"),
  supportController.createSupportRequest
);

supportRouter.get(
  "/admin/requests",
  authMiddleware,
  supportAdminMiddleware,
  validate(adminSupportRequestsQuerySchema, "query"),
  supportController.getAllSupportRequestsAdmin
);

supportRouter.patch(
  "/admin/requests/:id/status",
  authMiddleware,
  supportAdminMiddleware,
  validate(supportRequestIdParamSchema, "params"),
  validate(updateSupportRequestStatusSchema, "body"),
  supportController.updateSupportRequestStatusAdmin
);
