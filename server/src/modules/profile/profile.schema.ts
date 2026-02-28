import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string({ message: "Display name is required" })
    .trim()
    .min(1, "Display name is required"),
  monthlyBudget: z.coerce
    .number({ message: "Monthly budget is required" })
    .positive("Monthly budget must be greater than 0"),
  monthlyIncome: z.coerce
    .number({ message: "Monthly income is required" })
    .positive("Monthly income must be greater than 0"),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional(),
  removeAvatar: z
    .preprocess((value) => value === "true" || value === true, z.boolean())
    .optional()
});
