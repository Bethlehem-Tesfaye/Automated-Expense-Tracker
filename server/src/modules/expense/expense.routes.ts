import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import * as expenseContoller from "./expense.contoller";
import { validate } from "../../middleware/validate";
import {
  expenseIdParamSchema,
  addExpenseSchema,
  updateExpenseSchema,
  getExpenseQuerySchema,
  recentExpenseQuerySchema,
  monthQuerySchema,
  reportQuerySchema
} from "./expense.schema";

export const expenseRouter = express.Router();

// Collection-level routes
expenseRouter.get(
  "/",
  authMiddleware,
  validate(getExpenseQuerySchema, "query"),
  expenseContoller.getExpense
);

expenseRouter.post(
  "/",
  authMiddleware,
  validate(addExpenseSchema, "body"),
  expenseContoller.addExpense
);

// Static report routes
expenseRouter.get(
  "/recent",
  authMiddleware,
  validate(recentExpenseQuerySchema, "query"),
  expenseContoller.getRecentExpenses
);

expenseRouter.get(
  "/summary",
  authMiddleware,
  validate(monthQuerySchema, "query"),
  expenseContoller.getMonthlySummary
);

expenseRouter.get(
  "/category-summary",
  authMiddleware,
  validate(monthQuerySchema, "query"),
  expenseContoller.getCategorySummary
);

expenseRouter.get(
  "/report",
  authMiddleware,
  validate(reportQuerySchema, "query"),
  expenseContoller.getExpenseReport
);

// Dynamic routes
expenseRouter.get(
  "/:id",
  authMiddleware,
  validate(expenseIdParamSchema, "params"),
  expenseContoller.getExpenseById
);

expenseRouter.put(
  "/:id",
  authMiddleware,
  validate(expenseIdParamSchema, "params"),
  validate(updateExpenseSchema, "body"),
  expenseContoller.updateExpense
);

expenseRouter.delete(
  "/:id",
  authMiddleware,
  validate(expenseIdParamSchema, "params"),
  expenseContoller.deleteExpense
);

expenseRouter.put(
  "/restore/:id",
  authMiddleware,
  validate(expenseIdParamSchema, "params"),
  expenseContoller.restoreExpense
);
