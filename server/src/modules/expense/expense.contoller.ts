import express, { NextFunction, type Request, type Response } from "express";
import * as expenseService from "./expense.service";
import * as expenseReportService from "./expense-reports.service";
import { serialize } from "node:v8";

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
