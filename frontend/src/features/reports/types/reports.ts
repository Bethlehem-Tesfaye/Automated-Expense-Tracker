export type ReportPeriod = "week" | "month" | "year" | "custom";

export interface ExpenseReportQuery {
  period?: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}

export interface ExpenseReportItem {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  categoryName: string;
}

export interface ExpenseReportCategory {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface ExpenseReportData {
  period: ReportPeriod;
  from: string;
  to: string;
  totals: {
    totalAmount: number;
    transactionCount: number;
    averageAmount: number;
  };
  categoryBreakdown: ExpenseReportCategory[];
  expenses: ExpenseReportItem[];
}

export interface ExpenseReportResponse {
  data: ExpenseReportData;
}
