import type { ParsedReceipt } from "../../lib/gemini";

export type ReceiptEngine = "basic" | "pro";
export const PRO_RECEIPT_MONTHLY_LIMIT = 10;

export interface ProUsageInfo {
  used: number;
  limit: number;
  remaining: number;
  month: string;
  reached: boolean;
}

export interface ProcessReceiptInput {
  file: Express.Multer.File;
  userId?: string;
  engine: ReceiptEngine;
}

export interface ProcessReceiptResult {
  success: true;
  data: ParsedReceipt | null;
  rawText: string;
  imageUrl: string;
  proUsage: ProUsageInfo;
}
