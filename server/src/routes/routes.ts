import express from "express";
import { expenseRouter } from "../modules/expense/expense.routes";
import { categoryRouter } from "../modules/category/category.routes";

export const router = express.Router();

router.use("/expenses", expenseRouter);
router.use("/categories", categoryRouter);
