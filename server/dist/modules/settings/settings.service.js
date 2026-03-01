"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMySettings = exports.getMySettings = void 0;
const prisma_1 = require("../../lib/prisma");
const toSettingsResponse = (profile) => {
    return {
        id: profile.id,
        userId: profile.userId,
        defaultReceiptEngine: profile.defaultReceiptEngine === "pro" ? "pro" : "basic",
        defaultCurrency: ["USD", "EUR", "GBP", "KES", "ETB"].includes(profile.defaultCurrency)
            ? profile.defaultCurrency
            : "ETB",
        emailNotifications: profile.emailNotifications
    };
};
const getMySettings = async (userId) => {
    const profile = await prisma_1.prisma.profile.upsert({
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
exports.getMySettings = getMySettings;
const updateMySettings = async ({ userId, defaultReceiptEngine, defaultCurrency, emailNotifications }) => {
    const profile = await prisma_1.prisma.profile.upsert({
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
exports.updateMySettings = updateMySettings;
