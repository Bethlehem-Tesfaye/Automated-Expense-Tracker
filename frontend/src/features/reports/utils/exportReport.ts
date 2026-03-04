import * as XLSX from "xlsx";
import type { ExpenseReportData } from "../types/reports";

interface ExportPayload {
  report: ExpenseReportData;
  period: ExpenseReportData["period"];
  from: string;
  to: string;
}

const toDateLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const toFileStamp = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 8);

const buildBaseFileName = ({ period, from, to }: ExportPayload) => {
  const start = toFileStamp(from);
  const end = toFileStamp(to);
  return `expense-report-${period}-${start}-to-${end}`;
};

const quoteCsvValue = (value: string | number) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const buildExpenseRows = (report: ExpenseReportData) => {
  return report.expenses.map((expense) => ({
    Date: toDateLabel(expense.date),
    Merchant: expense.merchant,
    Category: expense.categoryName,
    Amount: expense.amount,
  }));
};

export const exportReportToCsv = (payload: ExportPayload) => {
  const { report } = payload;
  const expenseRows = buildExpenseRows(report);

  const headers = ["Date", "Merchant", "Category", "Amount"];
  const lines = [headers.map(quoteCsvValue).join(",")];

  expenseRows.forEach((row) => {
    lines.push(
      [row.Date, row.Merchant, row.Category, row.Amount]
        .map(quoteCsvValue)
        .join(","),
    );
  });

  const blob = new Blob([`${lines.join("\n")}\n`], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${buildBaseFileName(payload)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportReportToExcel = (payload: ExportPayload) => {
  const { report } = payload;

  const workbook = XLSX.utils.book_new();

  const summaryRows = [
    { Metric: "Period", Value: report.period },
    { Metric: "From", Value: toDateLabel(report.from) },
    { Metric: "To", Value: toDateLabel(report.to) },
    { Metric: "Total Spending", Value: report.totals.totalAmount },
    { Metric: "Transactions", Value: report.totals.transactionCount },
    { Metric: "Average Transaction", Value: report.totals.averageAmount },
  ];

  const categoryRows = report.categoryBreakdown.map((item) => ({
    Category: item.categoryName,
    Total: item.total,
    Percentage: Number(item.percentage.toFixed(2)),
  }));

  const expenseRows = buildExpenseRows(report);

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(summaryRows),
    "Summary",
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(categoryRows),
    "Categories",
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(expenseRows),
    "Expenses",
  );

  XLSX.writeFile(workbook, `${buildBaseFileName(payload)}.xlsx`);
};
