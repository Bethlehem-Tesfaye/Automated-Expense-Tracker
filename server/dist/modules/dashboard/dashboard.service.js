"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = void 0;
const prisma_1 = require("../../lib/prisma");
const CATEGORY_COLORS = [
    "#EA744D",
    "#2AA198",
    "#244B5A",
    "#E2C36A",
    "#D5A74D",
    "#111111",
    "#3B82F6",
    "#8B5CF6"
];
const formatCurrency = (amount) => `$${amount.toLocaleString("en-US")}`;
const formatPercent = (value) => {
    const rounded = Number(value.toFixed(1));
    return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
};
const parseMonthRange = (monthInput) => {
    const now = new Date();
    const source = monthInput ? new Date(`${monthInput}-01T00:00:00.000Z`) : now;
    const year = source.getUTCFullYear();
    const month = source.getUTCMonth();
    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    const previousStartDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const previousEndDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return {
        startDate,
        endDate,
        previousStartDate,
        previousEndDate
    };
};
const monthLabel = (date) => date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
const weekdayLabel = (date) => date.toLocaleString("en-US", { weekday: "short" });
const percentageChange = (current, previous) => {
    if (previous <= 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};
const trendToneFromDelta = (delta) => {
    if (delta > 0)
        return "positive";
    if (delta < 0)
        return "negative";
    return "neutral";
};
const getMonthlyTotals = async (userId, baseDate, months = 6) => {
    const offsets = Array.from({ length: months }, (_, index) => months - 1 - index);
    const rows = await Promise.all(offsets.map(async (offset) => {
        const year = baseDate.getUTCFullYear();
        const month = baseDate.getUTCMonth() - offset;
        const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
        const total = await prisma_1.prisma.expense.aggregate({
            where: {
                userId,
                deletedAt: null,
                date: { gte: start, lte: end }
            },
            _sum: { amount: true }
        });
        return {
            month: monthLabel(start),
            amount: Number(total._sum.amount ?? 0)
        };
    }));
    return rows;
};
const getWeeklyTotals = async (userId) => {
    const latestExpense = await prisma_1.prisma.expense.findFirst({
        where: { userId, deletedAt: null },
        orderBy: { date: "desc" },
        select: { date: true }
    });
    const today = new Date();
    const anchorDate = latestExpense && latestExpense.date > today ? latestExpense.date : today;
    const anchorMidnight = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate(), 0, 0, 0, 0);
    const dayOffsets = Array.from({ length: 7 }, (_, index) => 6 - index);
    const rows = await Promise.all(dayOffsets.map(async (offset) => {
        const start = new Date(anchorMidnight);
        start.setDate(anchorMidnight.getDate() - offset);
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
        const total = await prisma_1.prisma.expense.aggregate({
            where: {
                userId,
                deletedAt: null,
                date: { gte: start, lte: end }
            },
            _sum: { amount: true }
        });
        return {
            day: weekdayLabel(start),
            amount: Number(total._sum.amount ?? 0)
        };
    }));
    return rows;
};
const getCategorySpending = async (userId, startDate, endDate) => {
    const categories = await prisma_1.prisma.category.findMany({
        where: { userId, deletedAt: null },
        include: {
            expenses: {
                where: {
                    deletedAt: null,
                    date: { gte: startDate, lte: endDate }
                },
                select: { amount: true }
            }
        }
    });
    const rawSummary = categories
        .map((category) => ({
        category: category.name,
        total: category.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    }))
        .filter((item) => item.total > 0)
        .sort((left, right) => right.total - left.total);
    const totalAmount = rawSummary.reduce((sum, item) => sum + item.total, 0);
    if (totalAmount <= 0)
        return [];
    return rawSummary.map((item, index) => ({
        category: item.category,
        amount: Number(((item.total / totalAmount) * 100).toFixed(0)),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));
};
const getDashboardOverview = async (userId, monthInput) => {
    const { startDate, endDate, previousStartDate, previousEndDate } = parseMonthRange(monthInput);
    const [currentMonthTotal, previousMonthTotal, profile, categorySpending, monthlySpending, weeklySpending] = await Promise.all([
        prisma_1.prisma.expense.aggregate({
            where: {
                userId,
                deletedAt: null,
                date: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
        }),
        prisma_1.prisma.expense.aggregate({
            where: {
                userId,
                deletedAt: null,
                date: { gte: previousStartDate, lte: previousEndDate }
            },
            _sum: { amount: true }
        }),
        prisma_1.prisma.profile.findUnique({ where: { userId } }),
        getCategorySpending(userId, startDate, endDate),
        getMonthlyTotals(userId, endDate, 6),
        getWeeklyTotals(userId)
    ]);
    const currentSpending = Number(currentMonthTotal._sum.amount ?? 0);
    const previousSpending = Number(previousMonthTotal._sum.amount ?? 0);
    const totalChange = percentageChange(currentSpending, previousSpending);
    const monthlyBudget = Number(profile?.monthlyBudget ?? 0);
    const monthlyIncome = Number(profile?.monthlyIncome ?? 0);
    const budgetRemaining = monthlyBudget - currentSpending;
    const budgetUsedPercent = monthlyBudget > 0 ? (currentSpending / monthlyBudget) * 100 : 0;
    const currentSavingsRate = monthlyIncome > 0
        ? ((monthlyIncome - currentSpending) / monthlyIncome) * 100
        : 0;
    const previousSavingsRate = monthlyIncome > 0
        ? ((monthlyIncome - previousSpending) / monthlyIncome) * 100
        : 0;
    const savingsDelta = currentSavingsRate - previousSavingsRate;
    const topCategory = categorySpending[0];
    return {
        stats: [
            {
                title: "Total Spending",
                value: formatCurrency(currentSpending),
                trend: `${totalChange >= 0 ? "+" : ""}${formatPercent(totalChange)}% from last month`,
                description: "Current month's total expenses",
                trendTone: trendToneFromDelta(totalChange)
            },
            {
                title: "Budget Remaining",
                value: formatCurrency(Math.max(budgetRemaining, 0)),
                trend: `${formatPercent(budgetUsedPercent)}% used this month`,
                description: monthlyBudget > 0
                    ? "Amount left in your monthly budget"
                    : "Set monthlyBudget in profile to enable budget tracking",
                trendTone: budgetRemaining >= 0 ? "positive" : "negative"
            },
            {
                title: "Top Category",
                value: topCategory?.category ?? "N/A",
                trend: topCategory
                    ? `${topCategory.amount}% of total spending`
                    : "No category spending yet",
                description: "Your highest spending category",
                trendTone: "neutral"
            },
            {
                title: "Savings Rate",
                value: `${formatPercent(Math.max(currentSavingsRate, 0))}%`,
                trend: `${savingsDelta >= 0 ? "+" : ""}${formatPercent(savingsDelta)}% since last month`,
                description: monthlyIncome > 0
                    ? "Savings based on income and monthly spending"
                    : "Set monthlyIncome in profile to enable savings rate",
                trendTone: trendToneFromDelta(savingsDelta)
            }
        ],
        categorySpending,
        monthlySpending,
        weeklySpending
    };
};
exports.getDashboardOverview = getDashboardOverview;
