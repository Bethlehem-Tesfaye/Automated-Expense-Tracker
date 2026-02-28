import type { NextFunction, Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export const getDashboardOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const month = Array.isArray(req.query.month)
      ? String(req.query.month[0])
      : req.query.month
        ? String(req.query.month)
        : undefined;

    const overview = await dashboardService.getDashboardOverview(userId, month);

    return res.status(200).json({ data: overview });
  } catch (error) {
    return next(error);
  }
};
