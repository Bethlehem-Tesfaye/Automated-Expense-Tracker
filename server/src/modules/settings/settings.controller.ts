import type { NextFunction, Request, Response } from "express";
import * as settingsService from "./settings.service";

export const getMySettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const settings = await settingsService.getMySettings(userId);
    return res.status(200).json(settings);
  } catch (error) {
    return next(error);
  }
};

export const updateMySettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const settings = await settingsService.updateMySettings({
      userId,
      defaultReceiptEngine: req.body.defaultReceiptEngine,
      defaultCurrency: req.body.defaultCurrency,
      emailNotifications: req.body.emailNotifications
    });

    return res.status(200).json(settings);
  } catch (error) {
    return next(error);
  }
};
