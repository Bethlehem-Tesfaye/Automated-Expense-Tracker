import type { NextFunction, Request, Response } from "express";
import * as supportService from "./support.service";

export const getSupportResources = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resources = await supportService.getSupportResources();
    return res.status(200).json(resources);
  } catch (error) {
    return next(error);
  }
};

export const createSupportRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const request = await supportService.createSupportRequest({
      userId,
      subject: req.body.subject,
      message: req.body.message,
      category: req.body.category
    });

    return res.status(201).json(request);
  } catch (error) {
    return next(error);
  }
};

export const getSupportRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const requests = await supportService.getSupportRequests({
      userId,
      limit: req.query.limit as number | undefined
    });

    return res.status(200).json(requests);
  } catch (error) {
    return next(error);
  }
};

export const getAllSupportRequestsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await supportService.getAllSupportRequests({
      limit: req.query.limit as number | undefined,
      status: req.query.status as "open" | "resolved" | undefined
    });

    return res.status(200).json(requests);
  } catch (error) {
    return next(error);
  }
};

export const updateSupportRequestStatusAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await supportService.updateSupportRequestStatus({
      id: req.params.id,
      status: req.body.status
    });

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
};
