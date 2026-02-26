"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategorySummary = exports.getMonthlySummary = exports.getRecentExpenses = void 0;
const prisma_1 = require("../../lib/prisma");
const errors_1 = __importDefault(require("../../lib/errors"));
const getRecentExpenses = async (userId, limit = 10) => {
    const expenses = await prisma_1.prisma.expense.findMany({
        where: { userId, deletedAt: null },
        orderBy: { date: "desc" },
        take: limit,
        include: { category: true }
    });
    return { expenses };
};
exports.getRecentExpenses = getRecentExpenses;
const getMonthlySummary = async (userId, month) => {
    if (!month)
        throw new errors_1.default("Month is required", 400);
    const [year, monthStr] = month.split("-").map(Number);
    if (!year || !monthStr)
        throw new errors_1.default("Invalid month format", 400);
    const startDate = new Date(year, monthStr - 1, 1);
    const endDate = new Date(year, monthStr, 0, 23, 59, 59);
    const total = await prisma_1.prisma.expense.aggregate({
        where: { userId, deletedAt: null, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
    });
    return { total: total._sum.amount || 0 };
};
exports.getMonthlySummary = getMonthlySummary;
const getCategorySummary = async (userId, month) => {
    if (!month)
        throw new errors_1.default("Month is required", 400);
    const [year, monthStr] = month.split("-").map(Number);
    if (!year || !monthStr)
        throw new errors_1.default("Invalid month format", 400);
    const startDate = new Date(year, monthStr - 1, 1);
    const endDate = new Date(year, monthStr, 0, 23, 59, 59);
    const categories = await prisma_1.prisma.category.findMany({
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
exports.getCategorySummary = getCategorySummary;
