"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReceipt = void 0;
const gemini_1 = require("../../lib/gemini");
const veryfi_1 = require("../../lib/veryfi");
const ocr_1 = require("../../lib/ocr");
const upload_1 = require("../../middleware/upload");
const prisma_1 = require("../../lib/prisma");
const logger_1 = require("../../config/logger");
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
    const imageUrl = await (0, upload_1.uploadImageToCloudinary)(file, "receipts", userId);
    const candidateCategories = userId
        ? (await prisma_1.prisma.category.findMany({
            where: { userId, deletedAt: null },
            select: { name: true }
        })).map((category) => category.name)
        : [];
    if (engine === "pro") {
        try {
            const parsedWithVeryfi = await (0, veryfi_1.parseReceiptWithVeryfi)(file, candidateCategories);
            return {
                success: true,
                data: parsedWithVeryfi,
                rawText: "",
                imageUrl
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
                imageUrl
            };
        }
    }
    const rawText = await (0, ocr_1.extractTextFromBuffer)(file.buffer);
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
    return {
        success: true,
        data: parsed,
        rawText,
        imageUrl
    };
};
exports.processReceipt = processReceipt;
