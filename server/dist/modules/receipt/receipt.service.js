"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReceipt = exports.getProReceiptUsage = void 0;
const gemini_1 = require("../../lib/gemini");
const veryfi_1 = require("../../lib/veryfi");
const ocr_1 = require("../../lib/ocr");
const upload_1 = require("../../middleware/upload");
const prisma_1 = require("../../lib/prisma");
const logger_1 = require("../../config/logger");
const errors_1 = __importDefault(require("../../lib/errors"));
const types_1 = require("./types");
const currentMonthKey = () => new Date().toISOString().slice(0, 7);
const toUsageInfo = (used, month) => ({
    used,
    limit: types_1.PRO_RECEIPT_MONTHLY_LIMIT,
    remaining: Math.max(types_1.PRO_RECEIPT_MONTHLY_LIMIT - used, 0),
    month,
    reached: used >= types_1.PRO_RECEIPT_MONTHLY_LIMIT
});
const getCurrentUsage = async (userId) => {
    const month = currentMonthKey();
    const profile = await prisma_1.prisma.profile.upsert({
        where: { userId },
        create: { userId, proReceiptUsageCount: 0, proReceiptUsageMonth: month },
        update: {},
        select: { id: true, proReceiptUsageCount: true, proReceiptUsageMonth: true }
    });
    if (profile.proReceiptUsageMonth !== month) {
        const reset = await prisma_1.prisma.profile.update({
            where: { id: profile.id },
            data: {
                proReceiptUsageMonth: month,
                proReceiptUsageCount: 0
            },
            select: { proReceiptUsageCount: true }
        });
        return toUsageInfo(reset.proReceiptUsageCount, month);
    }
    return toUsageInfo(profile.proReceiptUsageCount, month);
};
const consumeProUsage = async (userId) => {
    const month = currentMonthKey();
    const usage = await prisma_1.prisma.$transaction(async (tx) => {
        const profile = await tx.profile.upsert({
            where: { userId },
            create: {
                userId,
                proReceiptUsageMonth: month,
                proReceiptUsageCount: 0
            },
            update: {},
            select: {
                id: true,
                proReceiptUsageCount: true,
                proReceiptUsageMonth: true
            }
        });
        const countInMonth = profile.proReceiptUsageMonth === month ? profile.proReceiptUsageCount : 0;
        if (countInMonth >= types_1.PRO_RECEIPT_MONTHLY_LIMIT) {
            throw new errors_1.default("Out of Pro engine limit for this month", 429);
        }
        const updated = await tx.profile.update({
            where: { id: profile.id },
            data: {
                proReceiptUsageMonth: month,
                proReceiptUsageCount: countInMonth + 1
            },
            select: { proReceiptUsageCount: true }
        });
        return updated.proReceiptUsageCount;
    });
    return toUsageInfo(usage, month);
};
const getProReceiptUsage = async (userId) => {
    const data = await getCurrentUsage(userId);
    return { data };
};
exports.getProReceiptUsage = getProReceiptUsage;
const toIsoDate = (value) => {
    const ymd = value.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
    if (ymd) {
        return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
    }
    const mdy = value.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (mdy) {
        const month = mdy[1].padStart(2, "0");
        const day = mdy[2].padStart(2, "0");
        const year = mdy[3];
        return `${year}-${month}-${day}`;
    }
    return null;
};
const fallbackParseReceipt = (text) => {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    const merchant = lines.find((line) => /[a-zA-Z]/.test(line)) ?? null;
    const amountMatches = Array.from(text.matchAll(/\b\d+[.,]\d{2}\b/g))
        .map((match) => Number(match[0].replace(",", ".")))
        .filter((value) => Number.isFinite(value));
    const amount = amountMatches.length ? Math.max(...amountMatches) : null;
    const dateCandidate = text.match(/\b\d{4}[-\/]\d{2}[-\/]\d{2}\b/)?.[0] ??
        text.match(/\b\d{1,2}[-\/]\d{1,2}[-\/]\d{4}\b/)?.[0] ??
        null;
    const date = dateCandidate ? toIsoDate(dateCandidate) : null;
    const parsed = {
        merchant,
        amount,
        date,
        category: "Other"
    };
    if (!parsed.merchant && !parsed.amount && !parsed.date) {
        return null;
    }
    return parsed;
};
const guessCategoryFromText = (text) => {
    const source = text.toLowerCase();
    if (/(brake|pedal|repair|garage|auto|car|bike|fuel|gas)/.test(source)) {
        return "Transport";
    }
    if (/(grocery|restaurant|cafe|food|meal|snack|drink)/.test(source)) {
        return "Food";
    }
    if (/(netflix|spotify|subscription|plan|membership)/.test(source)) {
        return "Subscriptions";
    }
    if (/(electric|water|internet|phone|utility|bill)/.test(source)) {
        return "Utilities";
    }
    if (/(movie|cinema|concert|game|entertainment)/.test(source)) {
        return "Entertainment";
    }
    return null;
};
const normalizeParsedReceipt = (parsed, rawText) => {
    if (!parsed)
        return null;
    const normalizedDate = parsed.date
        ? (toIsoDate(parsed.date) ?? parsed.date)
        : null;
    const normalizedCategory = parsed.category?.trim() || null;
    const category = !normalizedCategory || /^other$/i.test(normalizedCategory)
        ? (guessCategoryFromText(rawText) ?? normalizedCategory ?? "Other")
        : normalizedCategory;
    return {
        merchant: parsed.merchant?.trim() || null,
        amount: parsed.amount,
        date: normalizedDate,
        category
    };
};
const processReceipt = async ({ file, userId, engine }) => {
    const effectiveUserId = userId;
    if (!effectiveUserId) {
        throw new errors_1.default("Unauthorized", 401);
    }
    const proUsage = engine === "pro"
        ? await consumeProUsage(effectiveUserId)
        : await getCurrentUsage(effectiveUserId);
    const candidateCategories = effectiveUserId
        ? (await prisma_1.prisma.category.findMany({
            where: { userId: effectiveUserId, deletedAt: null },
            select: { name: true }
        })).map((category) => category.name)
        : [];
    if (engine === "pro") {
        const imageUrl = await (0, upload_1.uploadImageToCloudinary)(file, "receipts", userId);
        try {
            const parsedWithVeryfi = await (0, veryfi_1.parseReceiptWithVeryfi)(file, candidateCategories);
            return {
                success: true,
                data: parsedWithVeryfi,
                rawText: "",
                imageUrl,
                proUsage
            };
        }
        catch (error) {
            logger_1.logger.warn({ err: error }, "Veryfi failed, using OCR fallback in pro mode");
            const rawText = await (0, ocr_1.extractTextFromBuffer)(file.buffer);
            const parsedWithFallback = normalizeParsedReceipt(fallbackParseReceipt(rawText), rawText);
            return {
                success: true,
                data: parsedWithFallback,
                rawText,
                imageUrl,
                proUsage
            };
        }
    }
    const rawText = await (0, ocr_1.extractTextFromBuffer)(file.buffer);
    logger_1.logger.info({
        engine: "basic",
        userId: effectiveUserId,
        ocrText: rawText
    }, "Basic OCR extracted text");
    let parsed = null;
    try {
        parsed = await (0, gemini_1.parseReceiptWithGemini)(rawText, candidateCategories);
    }
    catch {
        parsed = null;
    }
    if (!parsed) {
        parsed = fallbackParseReceipt(rawText);
    }
    parsed = normalizeParsedReceipt(parsed, rawText);
    const imageUrl = await (0, upload_1.uploadImageToCloudinary)(file, "receipts", userId);
    return {
        success: true,
        data: parsed,
        rawText,
        imageUrl,
        proUsage
    };
};
exports.processReceipt = processReceipt;
