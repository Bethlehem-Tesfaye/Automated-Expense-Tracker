"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportQuerySchema = exports.monthQuerySchema = exports.recentExpenseQuerySchema = exports.getExpenseQuerySchema = exports.updateExpenseSchema = exports.addExpenseSchema = exports.expenseIdParamSchema = void 0;
const zod_1 = require("zod");
exports.expenseIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid expense ID format")
});
exports.addExpenseSchema = zod_1.z.object({
    amount: zod_1.z
        .number({ message: "Amount must be a valid number" })
        .positive("Amount must be greater than 0"),
    merchant: zod_1.z
        .string({ message: "Merchant is required" })
        .min(1, "Merchant cannot be empty"),
    categoryId: zod_1.z
        .string({ message: "Category ID is required" })
        .uuid("Invalid category ID format"),
    date: zod_1.z.coerce.date().optional()
});
exports.updateExpenseSchema = zod_1.z.object({
    amount: zod_1.z
        .number("Amount must be a valid number")
        .positive("Amount must be greater than 0")
        .optional(),
    merchant: zod_1.z.string().min(1, "Merchant cannot be empty").optional(),
    categoryId: zod_1.z.string().uuid("Invalid category ID format").optional(),
    date: zod_1.z.coerce.date().optional()
});
exports.getExpenseQuerySchema = zod_1.z.object({
    limit: zod_1.z.string().optional(),
    offset: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    categoryName: zod_1.z.string().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional()
});
exports.recentExpenseQuerySchema = zod_1.z.object({
    limit: zod_1.z.string().optional()
});
exports.monthQuerySchema = zod_1.z.object({
    month: zod_1.z
        .string({ message: "Month is required" })
        .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
});
exports.reportQuerySchema = zod_1.z
    .object({
    period: zod_1.z.enum(["week", "month", "year", "custom"]).optional(),
    date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .optional(),
    month: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
        .optional(),
    year: zod_1.z
        .string()
        .regex(/^\d{4}$/, "Year must be in YYYY format")
        .optional(),
    from: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "From must be in YYYY-MM-DD format")
        .optional(),
    to: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "To must be in YYYY-MM-DD format")
        .optional()
})
    .superRefine((query, ctx) => {
    const period = query.period ?? "week";
    if (period === "custom" && (!query.from || !query.to)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "From and To are required for custom period"
        });
    }
});
