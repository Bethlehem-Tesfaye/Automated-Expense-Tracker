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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const expenseContoller = __importStar(require("./expense.contoller"));
const validate_1 = require("../../middleware/validate");
const expense_schema_1 = require("./expense.schema");
exports.expenseRouter = express_1.default.Router();
// Collection-level routes
exports.expenseRouter.get("/", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.getExpenseQuerySchema, "query"), expenseContoller.getExpense);
exports.expenseRouter.post("/", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.addExpenseSchema, "body"), expenseContoller.addExpense);
// Static report routes
exports.expenseRouter.get("/recent", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.recentExpenseQuerySchema, "query"), expenseContoller.getRecentExpenses);
exports.expenseRouter.get("/summary", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.monthQuerySchema, "query"), expenseContoller.getMonthlySummary);
exports.expenseRouter.get("/category-summary", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.monthQuerySchema, "query"), expenseContoller.getCategorySummary);
// Dynamic routes
exports.expenseRouter.get("/:id", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.expenseIdParamSchema, "params"), expenseContoller.getExpenseById);
exports.expenseRouter.put("/:id", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.expenseIdParamSchema, "params"), (0, validate_1.validate)(expense_schema_1.updateExpenseSchema, "body"), expenseContoller.updateExpense);
exports.expenseRouter.delete("/:id", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.expenseIdParamSchema, "params"), expenseContoller.deleteExpense);
exports.expenseRouter.put("/restore/:id", auth_middleware_1.default, (0, validate_1.validate)(expense_schema_1.expenseIdParamSchema, "params"), expenseContoller.restoreExpense);
