import { z } from "zod";

export const createSupportRequestSchema = z.object({
  subject: z
    .string({ message: "Subject is required" })
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject must be less than 120 characters"),
  message: z
    .string({ message: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
  category: z.enum(["billing", "technical", "account", "feature", "other"])
});

export const getSupportRequestsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(20).default(10)
});

export const adminSupportRequestsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(["open", "resolved"]).optional()
});

export const supportRequestIdParamSchema = z.object({
  id: z.string().uuid()
});

export const updateSupportRequestStatusSchema = z.object({
  status: z.enum(["open", "resolved"])
});
