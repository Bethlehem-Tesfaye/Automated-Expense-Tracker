"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreExpense = exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.getExpense = exports.addExpense = void 0;
const prisma_1 = require("../../lib/prisma");
const errors_1 = __importDefault(require("../../lib/errors"));
const normalizeExpenseDate = (input) => {
    if (!input)
        return undefined;
    if (input instanceof Date)
        return input;
    const asDate = new Date(input);
    if (Number.isNaN(asDate.getTime())) {
        throw new errors_1.default("Invalid expense date", 400);
    }
    return asDate;
};
const addExpense = async ({ userId, amount, merchant, categoryId, date }) => {
    const normalizedDate = normalizeExpenseDate(date);
    const category = await prisma_1.prisma.category.findFirst({
        where: { id: categoryId, userId }
    });
    if (!category)
        throw new errors_1.default("Invalid category", 400);
    const expense = await prisma_1.prisma.expense.create({
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
exports.addExpense = addExpense;
const getExpense = async ({ userId, limit = 20, offset = 0, from, to, search, categoryName }) => {
    const whereCondition = {
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
    const expense = await prisma_1.prisma.expense.findMany({
        where: whereCondition,
        skip: Number(offset),
        take: Number(limit),
        orderBy: { date: "desc" },
        include: { category: true }
    });
    const totalCount = await prisma_1.prisma.expense.count({ where: whereCondition });
    return { expense, totalCount };
};
exports.getExpense = getExpense;
const getExpenseById = async ({ id, userId }) => {
    const expense = await prisma_1.prisma.expense.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        },
        include: { category: true }
    });
    if (!expense) {
        throw new errors_1.default("Expense not found", 404);
    }
    return { data: expense };
};
exports.getExpenseById = getExpenseById;
const updateExpense = async ({ id, userId, amount, merchant, categoryId, date }) => {
    const normalizedDate = normalizeExpenseDate(date);
    const data = {};
    if (amount !== undefined)
        data.amount = amount;
    if (merchant !== undefined)
        data.merchant = merchant;
    if (categoryId !== undefined) {
        const category = await prisma_1.prisma.category.findFirst({
            where: { id: categoryId, userId, deletedAt: null }
        });
        if (!category)
            throw new errors_1.default("Invalid category", 400);
        data.categoryId = categoryId;
    }
    if (normalizedDate !== undefined)
        data.date = normalizedDate;
    const expense = await prisma_1.prisma.expense.updateMany({
        where: {
            id,
            userId,
            deletedAt: null
        },
        data
    });
    if (expense.count === 0) {
        throw new errors_1.default("Expense not found or already deleted", 404);
    }
    const updatedExpense = await prisma_1.prisma.expense.findUnique({
        where: { id },
        include: { category: true }
    });
    return { data: updatedExpense };
};
exports.updateExpense = updateExpense;
const deleteExpense = async ({ id, userId }) => {
    const expense = await prisma_1.prisma.expense.updateMany({
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
        throw new errors_1.default("Expense not found or already deleted", 404);
    }
    return { success: true };
};
exports.deleteExpense = deleteExpense;
const restoreExpense = async ({ id, userId }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const expenseInTrash = await prisma_1.prisma.expense.findFirst({
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
        throw new errors_1.default("Expense cannot be restored (not found or deleted more than 30 days ago)", 404);
    }
    const restoredExpense = await prisma_1.prisma.expense.update({
        where: { id },
        data: {
            deletedAt: null
        }
    });
    return { data: restoredExpense };
};
exports.restoreExpense = restoreExpense;
