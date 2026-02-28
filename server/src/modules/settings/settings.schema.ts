import { z } from "zod";

export const updateSettingsSchema = z.object({
  defaultReceiptEngine: z.enum(["basic", "pro"]),
  defaultCurrency: z.enum(["USD", "EUR", "GBP", "KES", "ETB"]),
  emailNotifications: z.coerce.boolean()
});
