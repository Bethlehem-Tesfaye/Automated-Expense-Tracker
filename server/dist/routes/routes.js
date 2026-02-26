"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const expense_routes_1 = require("../modules/expense/expense.routes");
const category_routes_1 = require("../modules/category/category.routes");
const dashboard_routes_1 = require("../modules/dashboard/dashboard.routes");
exports.router = express_1.default.Router();
exports.router.use("/expenses", expense_routes_1.expenseRouter);
exports.router.use("/categories", category_routes_1.categoryRouter);
exports.router.use("/dashboard", dashboard_routes_1.dashboardRouter);
