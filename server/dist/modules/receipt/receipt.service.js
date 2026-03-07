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
    if (ymd)
        return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
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
    if (!parsed.merchant && !parsed.amount && !parsed.date)
        return null;
    return parsed;
};
// 🔥 Stricter keyword-based category override
const guessCategoryFromText = (text) => {
    const source = text.toLowerCase();
    // Optional Extra Safety: only match if the keyword is not part of an address or header
    const keywords = {
        Transport: /(brake|pedal|repair|garage|auto|car|bike|fuel|gas)/,
        Food: /(grocery|restaurant|cafe|food|meal|snack|drink|tea|coffee|salad|cake|pizza|burger|sandwich|bakery)/,
        Subscriptions: /(netflix|spotify|subscription|plan|membership)/,
        Utilities: /(electric|water|internet|phone|utility|bill)/,
        Entertainment: /(movie|cinema|concert|game|entertainment)/
    };
    for (const [category, regex] of Object.entries(keywords)) {
        if (regex.test(source))
            return category;
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
    // Keyword override takes precedence
    const category = guessCategoryFromText(rawText) ?? normalizedCategory ?? "Other";
    return {
        merchant: parsed.merchant?.trim() || null,
        amount: parsed.amount,
        date: normalizedDate,
        category
    };
};
const NO_FIELDS_EXTRACTED_MESSAGE = "No fields could be extracted. Please upload a clear receipt image or a valid receipt.";
const NOT_RECEIPT_MESSAGE = "The uploaded image does not look like a receipt. Please upload a valid receipt image.";
const BLURRY_RECEIPT_MESSAGE = "The receipt image is too blurry to read. Please upload a clearer receipt image.";
const ensureHasExtractedFields = (parsed) => {
    if (!parsed) {
        throw new errors_1.default(NO_FIELDS_EXTRACTED_MESSAGE, 422);
    }
    const hasMerchant = Boolean(parsed.merchant?.trim());
    const hasAmount = typeof parsed.amount === "number" && Number.isFinite(parsed.amount);
    const hasDate = Boolean(parsed.date);
    const hasCategory = Boolean(parsed.category?.trim()) &&
        parsed.category?.trim().toLowerCase() !== "other";
    if (!hasMerchant && !hasAmount && !hasDate && !hasCategory) {
        throw new errors_1.default(NO_FIELDS_EXTRACTED_MESSAGE, 422);
    }
};
const hasMeaningfulFields = (parsed) => {
    if (!parsed)
        return false;
    const hasMerchant = Boolean(parsed.merchant?.trim());
    const hasAmount = typeof parsed.amount === "number" && Number.isFinite(parsed.amount);
    const hasDate = Boolean(parsed.date);
    const hasCategory = Boolean(parsed.category?.trim()) &&
        parsed.category?.trim().toLowerCase() !== "other";
    return hasMerchant || hasAmount || hasDate || hasCategory;
};
const extractReceiptSignals = (rawText) => {
    const source = rawText.toLowerCase();
    const hasReceiptKeywords = /(receipt|subtotal|total|tax|vat|invoice|order|qty|item|cash|card|grand total|amount due|table no|eat in)/.test(source);
    const amountMatches = rawText.match(/\b\d+[.,]\d{2}\b/g) ?? [];
    const hasMoneyAmount = amountMatches.length >= 1;
    const hasMultipleAmounts = amountMatches.length >= 2;
    const hasDate = /\b\d{4}[-\/]\d{2}[-\/]\d{2}\b/.test(rawText) ||
        /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{4}\b/.test(rawText);
    const hasLineItemPattern = /[A-Za-z][A-Za-z\s]{2,}\s+\d+[.,]\d{2}/.test(rawText);
    const hasStrongReceiptSignals = (hasReceiptKeywords && hasMultipleAmounts) ||
        (hasLineItemPattern && hasMoneyAmount) ||
        (hasDate && hasReceiptKeywords && hasMoneyAmount);
    return {
        hasStrongReceiptSignals,
        hasReceiptKeywords,
        hasMoneyAmount,
        hasMultipleAmounts,
        hasDate,
        hasLineItemPattern
    };
};
const processReceipt = async ({ file, userId, engine }) => {
    const effectiveUserId = userId;
    if (!effectiveUserId)
        throw new errors_1.default("Unauthorized", 401);
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
            const rawText = await (0, ocr_1.extractPlainTextFromBuffer)(file.buffer);
            const parsedWithFallback = normalizeParsedReceipt(fallbackParseReceipt(rawText), rawText);
            ensureHasExtractedFields(parsedWithFallback);
            return {
                success: true,
                data: parsedWithFallback,
                rawText,
                imageUrl,
                proUsage
            };
        }
    }
    // Single OCR pass provides both plain and structured text
    const { plainText: rawText, structuredText, averageConfidence, lineCount } = await (0, ocr_1.extractStructuredTextFromBuffer)(file.buffer);
    logger_1.logger.info({
        engine: "basic",
        userId: effectiveUserId,
        ocrPlainText: rawText,
        ocrStructuredText: structuredText,
        ocrAverageConfidence: averageConfidence,
        ocrLineCount: lineCount
    }, "Basic OCR extracted text");
    let parsed = null;
    try {
        // Gemini sees the structured Markdown
        parsed = await (0, gemini_1.parseReceiptWithGemini)(structuredText, candidateCategories);
    }
    catch {
        parsed = null;
    }
    if (!parsed)
        parsed = fallbackParseReceipt(rawText);
    const receiptValidation = await (0, gemini_1.validateReceiptWithGemini)(structuredText);
    const receiptSignals = extractReceiptSignals(rawText);
    const extractedHasFields = hasMeaningfulFields(parsed);
    const hasVeryLowOcrQuality = averageConfidence < 0.4 || lineCount === 0 || rawText.trim().length < 20;
    if (receiptValidation?.isBlurry &&
        receiptValidation.confidence >= 0.75 &&
        !receiptSignals.hasStrongReceiptSignals) {
        throw new errors_1.default(BLURRY_RECEIPT_MESSAGE, 422);
    }
    if (receiptValidation &&
        !receiptValidation.isReceipt &&
        receiptValidation.confidence >= 0.75 &&
        !receiptSignals.hasStrongReceiptSignals) {
        throw new errors_1.default(NOT_RECEIPT_MESSAGE, 422);
    }
    if (!receiptSignals.hasStrongReceiptSignals &&
        !extractedHasFields &&
        hasVeryLowOcrQuality) {
        throw new errors_1.default(NOT_RECEIPT_MESSAGE, 422);
    }
    parsed = normalizeParsedReceipt(parsed, rawText);
    ensureHasExtractedFields(parsed);
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
