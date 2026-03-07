import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { makeUploader } from "../../middleware/upload";
import * as receiptController from "./receipt.controller";

const upload = makeUploader("receipts");

export const receiptRouter = express.Router();

receiptRouter.get("/pro-usage", authMiddleware, receiptController.getProUsage);

receiptRouter.post(
  "/",
  authMiddleware,
  upload.single("image"),
  receiptController.processReceipt
);
