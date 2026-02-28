import { z } from "zod";

export const addCategorySchema = z.object({
  name: z.string().min(1, "Category name is required")
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required")
});

export const getCategoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional()
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid()
});
