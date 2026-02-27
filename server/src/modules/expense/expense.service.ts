import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type {
  AddExpenseInput,
  DeleteExpenseType,
  GetExpenseByIdType,
  GetExpenseType,
  UpdateExpenseInput
} from "./types";
import CustomError from "../../lib/errors";

const normalizeExpenseDate = (input?: Date | string) => {
  if (!input) return undefined;
  if (input instanceof Date) return input;

  const asDate = new Date(input);
  if (Number.isNaN(asDate.getTime())) {
    throw new CustomError("Invalid expense date", 400);
  }

  return asDate;
};

export const addExpense = async ({
  userId,
  amount,
  merchant,
  categoryId,
  date
}: AddExpenseInput) => {
  const normalizedDate = normalizeExpenseDate(date);

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId }
  });

  if (!category) throw new CustomError("Invalid category", 400);
  const expense = await prisma.expense.create({
    data: {
      userId,
      amount,
      merchant,
      categoryId,
      date: normalizedDate ?? new Date()
    }
  });

  return expense;
};
export const getExpense = async ({
  userId,
  limit = 20,
  offset = 0,
  from,
  to,
  search,
  categoryName
}: GetExpenseType) => {
  const whereCondition: Prisma.ExpenseWhereInput = {
    userId,
    deletedAt: null
  };

  // Merchant Search
  if (search) {
    whereCondition.merchant = {
      contains: search,
      mode: "insensitive"
    };
  }

  // Category Filter
  if (categoryName) {
    whereCondition.category = {
      name: categoryName,
      deletedAt: null
    };
  }

  // Date Filter
  if (from || to)
    whereCondition.date = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) })
    };

  // Fetch expenses
  const expense = await prisma.expense.findMany({
    where: whereCondition,
    skip: Number(offset),
    take: Number(limit),
    orderBy: { date: "desc" },
    include: { category: true }
  });

  const totalCount = await prisma.expense.count({ where: whereCondition });

  return { expense, totalCount };
};

export const getExpenseById = async ({ id, userId }: GetExpenseByIdType) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      userId,
      deletedAt: null
    },
    include: { category: true }
  });
  if (!expense) {
    throw new CustomError("Expense not found", 404);
  }
  return { data: expense };
};

export const updateExpense = async ({
  id,
  userId,
  amount,
  merchant,
  categoryId,
  date
}: UpdateExpenseInput) => {
  const normalizedDate = normalizeExpenseDate(date);
  const data: Prisma.ExpenseUncheckedUpdateManyInput = {};

  if (amount !== undefined) data.amount = amount;
  if (merchant !== undefined) data.merchant = merchant;
  if (categoryId !== undefined) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, deletedAt: null }
    });

    if (!category) throw new CustomError("Invalid category", 400);
    data.categoryId = categoryId;
  }
  if (normalizedDate !== undefined) data.date = normalizedDate;

  const expense = await prisma.expense.updateMany({
    where: {
      id,
      userId,
      deletedAt: null
    },
    data
  });
  if (expense.count === 0) {
    throw new CustomError("Expense not found or already deleted", 404);
  }
  const updatedExpense = await prisma.expense.findUnique({
    where: { id },
    include: { category: true }
  });

  return { data: updatedExpense };
};

export const deleteExpense = async ({ id, userId }: DeleteExpenseType) => {
  const expense = await prisma.expense.updateMany({
    where: {
      id,
      userId,
      deletedAt: null
    },
    data: {
      deletedAt: new Date()
    }
  });
  if (expense.count === 0) {
    throw new CustomError("Expense not found or already deleted", 404);
  }

  return { success: true };
};

export const restoreExpense = async ({ id, userId }: DeleteExpenseType) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const expenseInTrash = await prisma.expense.findFirst({
    where: {
      id,
      userId,
      deletedAt: {
        not: null,
        gte: thirtyDaysAgo
      }
    }
  });

  if (!expenseInTrash) {
    throw new CustomError(
      "Expense cannot be restored (not found or deleted more than 30 days ago)",
      404
    );
  }
  const restoredExpense = await prisma.expense.update({
    where: { id },
    data: {
      deletedAt: null
    }
  });

  return { data: restoredExpense };
};
