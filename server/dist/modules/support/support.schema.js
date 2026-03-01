"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupportRequestStatusSchema = exports.supportRequestIdParamSchema = exports.adminSupportRequestsQuerySchema = exports.getSupportRequestsQuerySchema = exports.createSupportRequestSchema = void 0;
const zod_1 = require("zod");
exports.createSupportRequestSchema = zod_1.z.object({
    subject: zod_1.z
        .string({ message: "Subject is required" })
        .trim()
        .min(3, "Subject must be at least 3 characters")
        .max(120, "Subject must be less than 120 characters"),
    message: zod_1.z
        .string({ message: "Message is required" })
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(2000, "Message must be less than 2000 characters"),
    category: zod_1.z.enum(["billing", "technical", "account", "feature", "other"])
});
exports.getSupportRequestsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(20).default(10)
});
exports.adminSupportRequestsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(50).default(20),
    status: zod_1.z.enum(["open", "resolved"]).optional()
});
exports.supportRequestIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
exports.updateSupportRequestStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["open", "resolved"])
});
