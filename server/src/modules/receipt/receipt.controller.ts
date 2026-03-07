import type { NextFunction, Request, Response } from "express";
import CustomError from "../../lib/errors";
import * as receiptService from "./receipt.service";

export const processReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file } = req;
    const requestedEngine = req.body?.engine;

    if (!file) {
      throw new CustomError("No image file provided", 400);
    }

    const engine = requestedEngine === "pro" ? "pro" : "basic";

    const result = await receiptService.processReceipt({
      file,
      userId: req.userId,
      engine
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getProUsage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const usage = await receiptService.getProReceiptUsage(userId);
    return res.status(200).json(usage);
  } catch (error) {
    return next(error);
  }
};
