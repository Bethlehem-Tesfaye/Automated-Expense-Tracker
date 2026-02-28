import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import * as categoryController from "./category.controller";
import { validate } from "../../middleware/validate";
import {
  addCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  getCategoryQuerySchema
} from "./category.schema";

export const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  authMiddleware,
  validate(getCategoryQuerySchema, "query"),
  categoryController.getCategory
);

categoryRouter.get(
  "/:id",
  authMiddleware,
  validate(categoryIdParamSchema, "params"),
  categoryController.getCategoryById
);

categoryRouter.post(
  "/",
  authMiddleware,
  validate(addCategorySchema, "body"),
  categoryController.addCategory
);

categoryRouter.put(
  "/:id",
  authMiddleware,
  validate(categoryIdParamSchema, "params"),
  validate(updateCategorySchema, "body"),
  categoryController.updateCategory
);

categoryRouter.delete(
  "/:id",
  authMiddleware,
  validate(categoryIdParamSchema, "params"),
  categoryController.deleteCategory
);
