"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = void 0;
const zod_1 = require("zod");
exports.updateSettingsSchema = zod_1.z.object({
    defaultReceiptEngine: zod_1.z.enum(["basic", "pro"]),
    defaultCurrency: zod_1.z.enum(["USD", "EUR", "GBP", "KES", "ETB"]),
    emailNotifications: zod_1.z.coerce.boolean()
});
