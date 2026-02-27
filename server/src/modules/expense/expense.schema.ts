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
    .uuid("Invalid category ID format"),

  date: z.coerce.date().optional()
});

export const updateExpenseSchema = z.object({
  amount: z
    .number("Amount must be a valid number")
    .positive("Amount must be greater than 0")
    .optional(),

  merchant: z.string().min(1, "Merchant cannot be empty").optional(),

  categoryId: z.string().uuid("Invalid category ID format").optional(),

  date: z.coerce.date().optional()
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

export const reportQuerySchema = z
  .object({
    period: z.enum(["week", "month", "year", "custom"]).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
      .optional(),
    year: z
      .string()
      .regex(/^\d{4}$/, "Year must be in YYYY format")
      .optional(),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "From must be in YYYY-MM-DD format")
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "To must be in YYYY-MM-DD format")
      .optional()
  })
  .superRefine((query, ctx) => {
    const period = query.period ?? "week";

    if (period === "custom" && (!query.from || !query.to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "From and To are required for custom period"
      });
    }
  });
