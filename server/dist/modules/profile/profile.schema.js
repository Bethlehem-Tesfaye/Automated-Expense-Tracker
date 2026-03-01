"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    displayName: zod_1.z
        .string({ message: "Display name is required" })
        .trim()
        .min(1, "Display name is required"),
    monthlyBudget: zod_1.z.coerce
        .number({ message: "Monthly budget is required" })
        .positive("Monthly budget must be greater than 0"),
    monthlyIncome: zod_1.z.coerce
        .number({ message: "Monthly income is required" })
        .positive("Monthly income must be greater than 0"),
    avatarUrl: zod_1.z.string().url("Avatar URL must be a valid URL").optional(),
    removeAvatar: zod_1.z
        .preprocess((value) => value === "true" || value === true, zod_1.z.boolean())
        .optional()
});
