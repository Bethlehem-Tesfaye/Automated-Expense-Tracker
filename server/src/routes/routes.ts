import express from "express";
import { expenseRouter } from "../modules/expense/expense.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes";
import { profileRouter } from "../modules/profile/profile.routes";
import { receiptRouter } from "../modules/receipt/receipt.routes";

export const router = express.Router();

router.use("/expenses", expenseRouter);
router.use("/categories", categoryRouter);
router.use("/dashboard", dashboardRouter);
router.use("/profile", profileRouter);
router.use("/receipt", receiptRouter);
