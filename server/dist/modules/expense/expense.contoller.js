"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenseReport = exports.getCategorySummary = exports.getMonthlySummary = exports.getRecentExpenses = exports.restoreExpense = exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.addExpense = exports.getExpense = void 0;
const expenseService = __importStar(require("./expense.service"));
const expenseReportService = __importStar(require("./expense-reports.service"));
const getExpense = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { expense, totalCount } = await expenseService.getExpense({
            userId,
            ...req.query
        });
        return res.status(200).json({ data: expense, totalCount });
    }
    catch (error) {
        return next(error);
    }
};
exports.getExpense = getExpense;
const addExpense = async (req, res, next) => {
    try {
        const userId = req.userId;
        const expense = await expenseService.addExpense({
            ...req.body,
            userId
        });
        return res.status(201).json({ data: expense });
    }
    catch (error) {
        return next(error);
    }
};
exports.addExpense = addExpense;
const getExpenseById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const expense = await expenseService.getExpenseById({ id, userId });
        return res.status(200).json({ data: expense });
    }
    catch (error) {
        return next(error);
    }
};
exports.getExpenseById = getExpenseById;
const updateExpense = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const expense = await expenseService.updateExpense({
            id,
            userId,
            ...req.body
        });
        return res.status(200).json({ data: expense });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        await expenseService.deleteExpense({ id, userId });
        return res.sendStatus(204);
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteExpense = deleteExpense;
const restoreExpense = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const expense = await expenseService.restoreExpense({ id, userId });
        return res.status(200).json({ data: expense });
    }
    catch (error) {
        return next(error);
    }
};
exports.restoreExpense = restoreExpense;
const getRecentExpenses = async (req, res, next) => {
    try {
        const userId = req.userId;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const { expenses } = await expenseReportService.getRecentExpenses(userId, limit);
        return res.status(200).json({ data: expenses });
    }
    catch (error) {
        return next(error);
    }
};
exports.getRecentExpenses = getRecentExpenses;
const getMonthlySummary = async (req, res, next) => {
    try {
        const userId = req.userId;
        const month = Array.isArray(req.query.month)
            ? String(req.query.month[0])
            : String(req.query.month);
        const summary = await expenseReportService.getMonthlySummary(userId, month);
        return res.status(200).json({ data: summary });
    }
    catch (error) {
        return next(error);
    }
};
exports.getMonthlySummary = getMonthlySummary;
const getCategorySummary = async (req, res, next) => {
    try {
        const userId = req.userId;
        const month = Array.isArray(req.query.month)
            ? String(req.query.month[0])
            : String(req.query.month);
        const summary = await expenseReportService.getCategorySummary(userId, month);
        return res.status(200).json({ data: summary });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCategorySummary = getCategorySummary;
const getExpenseReport = async (req, res, next) => {
    try {
        const userId = req.userId;
        const report = await expenseReportService.getExpenseReport(userId, {
            period: req.query.period,
            date: req.query.date ? String(req.query.date) : undefined,
            month: req.query.month ? String(req.query.month) : undefined,
            year: req.query.year ? String(req.query.year) : undefined,
            from: req.query.from ? String(req.query.from) : undefined,
            to: req.query.to ? String(req.query.to) : undefined
        });
        return res.status(200).json(report);
    }
    catch (error) {
        return next(error);
    }
};
exports.getExpenseReport = getExpenseReport;
