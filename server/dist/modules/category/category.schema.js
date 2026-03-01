"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryIdParamSchema = exports.getCategoryQuerySchema = exports.updateCategorySchema = exports.addCategorySchema = void 0;
const zod_1 = require("zod");
exports.addCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Category name is required")
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Category name is required")
});
exports.getCategoryQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().min(0).default(0),
    search: zod_1.z.string().optional()
});
exports.categoryIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
