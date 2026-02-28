import { prisma } from "../../lib/prisma";
import type { SettingsResponse, UpdateSettingsInput } from "./types";

const toSettingsResponse = (profile: {
  id: string;
  userId: string;
  defaultReceiptEngine: string;
  defaultCurrency: string;
  emailNotifications: boolean;
}): SettingsResponse => {
  return {
    id: profile.id,
    userId: profile.userId,
    defaultReceiptEngine:
      profile.defaultReceiptEngine === "pro" ? "pro" : "basic",
    defaultCurrency: ["USD", "EUR", "GBP", "KES", "ETB"].includes(
      profile.defaultCurrency
    )
      ? (profile.defaultCurrency as SettingsResponse["defaultCurrency"])
      : "ETB",
    emailNotifications: profile.emailNotifications
  };
};

export const getMySettings = async (userId: string) => {
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: {
      id: true,
      userId: true,
      defaultReceiptEngine: true,
      defaultCurrency: true,
      emailNotifications: true
    }
  });

  return { data: toSettingsResponse(profile) };
};

export const updateMySettings = async ({
  userId,
  defaultReceiptEngine,
  defaultCurrency,
  emailNotifications
}: UpdateSettingsInput) => {
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      defaultReceiptEngine,
      defaultCurrency,
      emailNotifications
    },
    update: {
      defaultReceiptEngine,
      defaultCurrency,
      emailNotifications
    },
    select: {
      id: true,
      userId: true,
      defaultReceiptEngine: true,
      defaultCurrency: true,
      emailNotifications: true
    }
  });

  return { data: toSettingsResponse(profile) };
};
