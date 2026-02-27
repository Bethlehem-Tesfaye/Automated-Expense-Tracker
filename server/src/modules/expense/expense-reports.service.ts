import { prisma } from "../../lib/prisma";
import CustomError from "../../lib/errors";

interface GetExpenseReportInput {
  period?: "week" | "month" | "year" | "custom";
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}

const toStartOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const toEndOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const getReportRange = (input: GetExpenseReportInput) => {
  const period = input.period ?? "week";
  const now = new Date();

  if (period === "custom") {
    if (!input.from || !input.to) {
      throw new CustomError("From and To are required for custom period", 400);
    }

    const from = toStartOfDay(new Date(input.from));
    const to = toEndOfDay(new Date(input.to));

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new CustomError("Invalid custom date range", 400);
    }

    if (from > to) {
      throw new CustomError("From date cannot be after To date", 400);
    }

    return { period, from, to };
  }

  if (period === "year") {
    const reportYear = input.year ? Number(input.year) : now.getFullYear();
    if (!reportYear || Number.isNaN(reportYear)) {
      throw new CustomError("Invalid year", 400);
    }

    return {
      period,
      from: new Date(reportYear, 0, 1, 0, 0, 0, 0),
      to: new Date(reportYear, 11, 31, 23, 59, 59, 999)
    };
  }

  if (period === "month") {
    const selectedMonth = input.month
      ? input.month
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [year, monthValue] = selectedMonth.split("-").map(Number);
    if (!year || !monthValue) {
      throw new CustomError("Invalid month format", 400);
    }

    return {
      period,
      from: new Date(year, monthValue - 1, 1, 0, 0, 0, 0),
      to: new Date(year, monthValue, 0, 23, 59, 59, 999)
    };
  }

  const anchorDate = input.date ? new Date(input.date) : now;
  if (Number.isNaN(anchorDate.getTime())) {
    throw new CustomError("Invalid date", 400);
  }

  const day = anchorDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() + diffToMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    period,
    from: toStartOfDay(weekStart),
    to: toEndOfDay(weekEnd)
  };
};

export const getRecentExpenses = async (userId: string, limit = 10) => {
  const expenses = await prisma.expense.findMany({
    where: { userId, deletedAt: null },
    orderBy: { date: "desc" },
    take: limit,
    include: { category: true }
  });

  return { expenses };
};

export const getMonthlySummary = async (userId: string, month: string) => {
  if (!month) throw new CustomError("Month is required", 400);
  const [year, monthStr] = month.split("-").map(Number);
  if (!year || !monthStr) throw new CustomError("Invalid month format", 400);

  const startDate = new Date(year, monthStr - 1, 1);
  const endDate = new Date(year, monthStr, 0, 23, 59, 59);

  const total = await prisma.expense.aggregate({
    where: { userId, deletedAt: null, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true }
  });

  return { total: total._sum.amount || 0 };
};

export const getCategorySummary = async (userId: string, month: string) => {
  if (!month) throw new CustomError("Month is required", 400);

  const [year, monthStr] = month.split("-").map(Number);
  if (!year || !monthStr) throw new CustomError("Invalid month format", 400);

  const startDate = new Date(year, monthStr - 1, 1);
  const endDate = new Date(year, monthStr, 0, 23, 59, 59);

  const categories = await prisma.category.findMany({
    where: { userId, deletedAt: null },
    include: {
      expenses: {
        where: { date: { gte: startDate, lte: endDate }, deletedAt: null },
        select: { amount: true }
      }
    }
  });

  const summary = categories.map((c) => ({
    category: c.name,
    total: c.expenses.reduce((acc, e) => acc + e.amount, 0)
  }));

  return { summary };
};

export const getExpenseReport = async (
  userId: string,
  input: GetExpenseReportInput
) => {
  const { period, from, to } = getReportRange(input);

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      deletedAt: null,
      date: {
        gte: from,
        lte: to
      }
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      date: "desc"
    }
  });

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const transactionCount = expenses.length;
  const averageAmount =
    transactionCount > 0 ? totalAmount / transactionCount : 0;

  const categoryMap = new Map<
    string,
    { categoryId: string; categoryName: string; total: number }
  >();

  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.categoryId);
    if (existing) {
      existing.total += expense.amount;
      return;
    }

    categoryMap.set(expense.categoryId, {
      categoryId: expense.categoryId,
      categoryName: expense.category.name,
      total: expense.amount
    });
  });

  const categoryBreakdown = Array.from(categoryMap.values())
    .map((item) => ({
      ...item,
      percentage: totalAmount > 0 ? (item.total / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);

  return {
    data: {
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      totals: {
        totalAmount,
        transactionCount,
        averageAmount
      },
      categoryBreakdown,
      expenses: expenses.map((expense) => ({
        id: expense.id,
        merchant: expense.merchant,
        amount: expense.amount,
        date: expense.date,
        categoryName: expense.category.name
      }))
    }
  };
};
