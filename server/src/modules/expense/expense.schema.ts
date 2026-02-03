import { z } from "zod";

export const expenseIdParamSchema = z.object({
  id: z.string().uuid("Invalid expense ID format")
});

export const addExpenseSchema = z.object({
  amount: z
    .number({ message: "Amount must be a valid number" })
    .positive("Amount must be greater than 0"),

  merchant: z
    .string({ message: "Merchant is required" })
    .min(1, "Merchant cannot be empty"),

  categoryId: z
    .string({ message: "Category ID is required" })
    .uuid("Invalid category ID format")
});

export const updateExpenseSchema = z.object({
  amount: z
    .number("Amount must be a valid number")
    .positive("Amount must be greater than 0")
    .optional(),

  merchant: z.string().min(1, "Merchant cannot be empty").optional(),

  categoryId: z.string().uuid("Invalid category ID format").optional()
});

export const getExpenseQuerySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),

  search: z.string().optional(),

  categoryName: z.string().optional(),

  from: z.string().optional(),
  to: z.string().optional()
});

export const recentExpenseQuerySchema = z.object({
  limit: z.string().optional()
});

export const monthQuerySchema = z.object({
  month: z
    .string({ message: "Month is required" })
    .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
});
