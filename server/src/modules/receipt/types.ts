import type { ParsedReceipt } from "../../lib/gemini";

export type ReceiptEngine = "basic" | "pro";

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
}
