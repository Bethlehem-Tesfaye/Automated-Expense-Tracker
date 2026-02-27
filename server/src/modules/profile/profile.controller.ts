import type { NextFunction, Request, Response } from "express";
import * as profileService from "./profile.service";
import { uploadImageToCloudinary } from "../../middleware/upload";

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const profile = await profileService.getMyProfile(userId);
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

export const upsertMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const removeAvatar = req.body.removeAvatar === true;
    const uploadedAvatarUrl = req.file
      ? await uploadImageToCloudinary(
          req.file,
          "expense-tracker/profile",
          userId
        )
      : undefined;
    const bodyAvatarUrl =
      typeof req.body.avatarUrl === "string" && req.body.avatarUrl.trim()
        ? req.body.avatarUrl.trim()
        : undefined;

    const profile = await profileService.upsertMyProfile({
      userId,
      displayName: String(req.body.displayName),
      monthlyBudget: Number(req.body.monthlyBudget),
      monthlyIncome: Number(req.body.monthlyIncome),
      avatarUrl: removeAvatar ? null : (uploadedAvatarUrl ?? bodyAvatarUrl),
      removeAvatar
    });

    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};
