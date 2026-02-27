import type { NextFunction, Request, Response } from "express";
import * as expenseService from "./expense.service";
import * as expenseReportService from "./expense-reports.service";

export const getExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const { expense, totalCount } = await expenseService.getExpense({
      userId,
      ...req.query
    });

    return res.status(200).json({ data: expense, totalCount });
  } catch (error) {
    return next(error);
  }
};

export const addExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const expense = await expenseService.addExpense({
      ...req.body,
      userId
    });
    return res.status(201).json({ data: expense });
  } catch (error) {
    return next(error);
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const expense = await expenseService.getExpenseById({ id, userId });
    return res.status(200).json({ data: expense });
  } catch (error) {
    return next(error);
  }
};

export const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const expense = await expenseService.updateExpense({
      id,
      userId,
      ...req.body
    });
    return res.status(200).json({ data: expense });
  } catch (error) {
    return next(error);
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    await expenseService.deleteExpense({ id, userId });
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

export const restoreExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const expense = await expenseService.restoreExpense({ id, userId });
    return res.status(200).json({ data: expense });
  } catch (error) {
    return next(error);
  }
};

export const getRecentExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const { expenses } = await expenseReportService.getRecentExpenses(
      userId,
      limit
    );
    return res.status(200).json({ data: expenses });
  } catch (error) {
    return next(error);
  }
};

export const getMonthlySummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const month = Array.isArray(req.query.month)
      ? String(req.query.month[0])
      : String(req.query.month!);

    const summary = await expenseReportService.getMonthlySummary(userId, month);
    return res.status(200).json({ data: summary });
  } catch (error) {
    return next(error);
  }
};

export const getCategorySummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const month = Array.isArray(req.query.month)
      ? String(req.query.month[0])
      : String(req.query.month!);

    const summary = await expenseReportService.getCategorySummary(
      userId,
      month
    );
    return res.status(200).json({ data: summary });
  } catch (error) {
    return next(error);
  }
};

export const getExpenseReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const report = await expenseReportService.getExpenseReport(userId, {
      period: req.query.period as
        | "week"
        | "month"
        | "year"
        | "custom"
        | undefined,
      date: req.query.date ? String(req.query.date) : undefined,
      month: req.query.month ? String(req.query.month) : undefined,
      year: req.query.year ? String(req.query.year) : undefined,
      from: req.query.from ? String(req.query.from) : undefined,
      to: req.query.to ? String(req.query.to) : undefined
    });

    return res.status(200).json(report);
  } catch (error) {
    return next(error);
  }
};
