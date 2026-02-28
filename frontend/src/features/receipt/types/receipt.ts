export type ReceiptEngine = "basic" | "pro";

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
}
