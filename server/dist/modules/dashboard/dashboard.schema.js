"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardOverviewQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardOverviewQuerySchema = zod_1.z.object({
    month: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
        .optional()
});
