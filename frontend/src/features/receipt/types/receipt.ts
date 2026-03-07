export type ReceiptEngine = "basic" | "pro";

export interface ProUsageData {
  used: number;
  limit: number;
  remaining: number;
  month: string;
  reached: boolean;
}

export interface ParsedReceiptData {
  merchant: string | null;
  amount: number | null;
  date: string | null;
  category: string | null;
}

export interface ReceiptProcessResponse {
  success: boolean;
  data: ParsedReceiptData | null;
  rawText: string;
  imageUrl: string;
  proUsage: ProUsageData;
}

export interface ProUsageResponse {
  data: ProUsageData;
}
