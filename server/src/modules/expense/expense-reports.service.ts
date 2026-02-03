import { prisma } from "../../lib/prisma";
import CustomError from "../../lib/errors";

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
