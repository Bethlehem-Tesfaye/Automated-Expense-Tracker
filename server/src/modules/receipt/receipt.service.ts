import {
  parseReceiptWithGemini,
  validateReceiptWithGemini,
  type ParsedReceipt
} from "../../lib/gemini";
import { parseReceiptWithVeryfi } from "../../lib/veryfi";
import {
  extractStructuredTextFromBuffer,
  extractPlainTextFromBuffer
} from "../../lib/ocr";
import { uploadImageToCloudinary } from "../../middleware/upload";
import { prisma } from "../../lib/prisma";
import { logger } from "../../config/logger";
import CustomError from "../../lib/errors";
import {
  PRO_RECEIPT_MONTHLY_LIMIT,
  type ProcessReceiptInput,
  type ProcessReceiptResult,
  type ProUsageInfo
} from "./types";

const currentMonthKey = () => new Date().toISOString().slice(0, 7);

const toUsageInfo = (used: number, month: string): ProUsageInfo => ({
  used,
  limit: PRO_RECEIPT_MONTHLY_LIMIT,
  remaining: Math.max(PRO_RECEIPT_MONTHLY_LIMIT - used, 0),
  month,
  reached: used >= PRO_RECEIPT_MONTHLY_LIMIT
});

const getCurrentUsage = async (userId: string): Promise<ProUsageInfo> => {
  const month = currentMonthKey();

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, proReceiptUsageCount: 0, proReceiptUsageMonth: month },
    update: {},
    select: { id: true, proReceiptUsageCount: true, proReceiptUsageMonth: true }
  });

  if (profile.proReceiptUsageMonth !== month) {
    const reset = await prisma.profile.update({
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

const consumeProUsage = async (userId: string): Promise<ProUsageInfo> => {
  const month = currentMonthKey();

  const usage = await prisma.$transaction(async (tx) => {
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

    const countInMonth =
      profile.proReceiptUsageMonth === month ? profile.proReceiptUsageCount : 0;

    if (countInMonth >= PRO_RECEIPT_MONTHLY_LIMIT) {
      throw new CustomError("Out of Pro engine limit for this month", 429);
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

export const getProReceiptUsage = async (userId: string) => {
  const data = await getCurrentUsage(userId);
  return { data };
};

const toIsoDate = (value: string): string | null => {
  const ymd = value.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  const mdy = value.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mdy) {
    const month = mdy[1].padStart(2, "0");
    const day = mdy[2].padStart(2, "0");
    const year = mdy[3];
    return `${year}-${month}-${day}`;
  }

  return null;
};

const fallbackParseReceipt = (text: string): ParsedReceipt | null => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const merchant = lines.find((line) => /[a-zA-Z]/.test(line)) ?? null;

  const amountMatches = Array.from(text.matchAll(/\b\d+[.,]\d{2}\b/g))
    .map((match) => Number(match[0].replace(",", ".")))
    .filter((value) => Number.isFinite(value));

  const amount = amountMatches.length ? Math.max(...amountMatches) : null;

  const dateCandidate =
    text.match(/\b\d{4}[-\/]\d{2}[-\/]\d{2}\b/)?.[0] ??
    text.match(/\b\d{1,2}[-\/]\d{1,2}[-\/]\d{4}\b/)?.[0] ??
    null;

  const date = dateCandidate ? toIsoDate(dateCandidate) : null;

  const parsed: ParsedReceipt = {
    merchant,
    amount,
    date,
    category: "Other"
  };

  if (!parsed.merchant && !parsed.amount && !parsed.date) return null;

  return parsed;
};

// 🔥 Stricter keyword-based category override
const guessCategoryFromText = (text: string): string | null => {
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
    if (regex.test(source)) return category;
  }

  return null;
};

const normalizeParsedReceipt = (
  parsed: ParsedReceipt | null,
  rawText: string
): ParsedReceipt | null => {
  if (!parsed) return null;

  const normalizedDate = parsed.date
    ? (toIsoDate(parsed.date) ?? parsed.date)
    : null;
  const normalizedCategory = parsed.category?.trim() || null;

  // Keyword override takes precedence
  const category =
    guessCategoryFromText(rawText) ?? normalizedCategory ?? "Other";

  return {
    merchant: parsed.merchant?.trim() || null,
    amount: parsed.amount,
    date: normalizedDate,
    category
  };
};

const NO_FIELDS_EXTRACTED_MESSAGE =
  "No fields could be extracted. Please upload a clear receipt image or a valid receipt.";

const NOT_RECEIPT_MESSAGE =
  "The uploaded image does not look like a receipt. Please upload a valid receipt image.";

const BLURRY_RECEIPT_MESSAGE =
  "The receipt image is too blurry to read. Please upload a clearer receipt image.";

const ensureHasExtractedFields = (parsed: ParsedReceipt | null) => {
  if (!parsed) {
    throw new CustomError(NO_FIELDS_EXTRACTED_MESSAGE, 422);
  }

  const hasMerchant = Boolean(parsed.merchant?.trim());
  const hasAmount =
    typeof parsed.amount === "number" && Number.isFinite(parsed.amount);
  const hasDate = Boolean(parsed.date);
  const hasCategory =
    Boolean(parsed.category?.trim()) &&
    parsed.category?.trim().toLowerCase() !== "other";

  if (!hasMerchant && !hasAmount && !hasDate && !hasCategory) {
    throw new CustomError(NO_FIELDS_EXTRACTED_MESSAGE, 422);
  }
};

const hasMeaningfulFields = (parsed: ParsedReceipt | null) => {
  if (!parsed) return false;

  const hasMerchant = Boolean(parsed.merchant?.trim());
  const hasAmount =
    typeof parsed.amount === "number" && Number.isFinite(parsed.amount);
  const hasDate = Boolean(parsed.date);
  const hasCategory =
    Boolean(parsed.category?.trim()) &&
    parsed.category?.trim().toLowerCase() !== "other";

  return hasMerchant || hasAmount || hasDate || hasCategory;
};

const extractReceiptSignals = (rawText: string) => {
  const source = rawText.toLowerCase();

  const hasReceiptKeywords =
    /(receipt|subtotal|total|tax|vat|invoice|order|qty|item|cash|card|grand total|amount due|table no|eat in)/.test(
      source
    );

  const amountMatches = rawText.match(/\b\d+[.,]\d{2}\b/g) ?? [];
  const hasMoneyAmount = amountMatches.length >= 1;
  const hasMultipleAmounts = amountMatches.length >= 2;

  const hasDate =
    /\b\d{4}[-\/]\d{2}[-\/]\d{2}\b/.test(rawText) ||
    /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{4}\b/.test(rawText);

  const hasLineItemPattern = /[A-Za-z][A-Za-z\s]{2,}\s+\d+[.,]\d{2}/.test(
    rawText
  );

  const hasStrongReceiptSignals =
    (hasReceiptKeywords && hasMultipleAmounts) ||
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

export const processReceipt = async ({
  file,
  userId,
  engine
}: ProcessReceiptInput): Promise<ProcessReceiptResult> => {
  const effectiveUserId = userId;

  if (!effectiveUserId) throw new CustomError("Unauthorized", 401);

  const proUsage =
    engine === "pro"
      ? await consumeProUsage(effectiveUserId)
      : await getCurrentUsage(effectiveUserId);

  const candidateCategories = effectiveUserId
    ? (
        await prisma.category.findMany({
          where: { userId: effectiveUserId, deletedAt: null },
          select: { name: true }
        })
      ).map((category) => category.name)
    : [];

  if (engine === "pro") {
    const imageUrl = await uploadImageToCloudinary(file, "receipts", userId);

    try {
      const parsedWithVeryfi = await parseReceiptWithVeryfi(
        file,
        candidateCategories
      );
      return {
        success: true,
        data: parsedWithVeryfi,
        rawText: "",
        imageUrl,
        proUsage
      };
    } catch (error) {
      logger.warn(
        { err: error },
        "Veryfi failed, using OCR fallback in pro mode"
      );

      const rawText = await extractPlainTextFromBuffer(file.buffer);
      const parsedWithFallback = normalizeParsedReceipt(
        fallbackParseReceipt(rawText),
        rawText
      );

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
  const {
    plainText: rawText,
    structuredText,
    averageConfidence,
    lineCount
  } = await extractStructuredTextFromBuffer(file.buffer);

  logger.info(
    {
      engine: "basic",
      userId: effectiveUserId,
      ocrPlainText: rawText,
      ocrStructuredText: structuredText,
      ocrAverageConfidence: averageConfidence,
      ocrLineCount: lineCount
    },
    "Basic OCR extracted text"
  );

  let parsed: ParsedReceipt | null = null;

  try {
    // Gemini sees the structured Markdown
    parsed = await parseReceiptWithGemini(structuredText, candidateCategories);
  } catch {
    parsed = null;
  }

  if (!parsed) parsed = fallbackParseReceipt(rawText);

  const receiptValidation = await validateReceiptWithGemini(structuredText);
  const receiptSignals = extractReceiptSignals(rawText);
  const extractedHasFields = hasMeaningfulFields(parsed);
  const hasVeryLowOcrQuality =
    averageConfidence < 0.4 || lineCount === 0 || rawText.trim().length < 20;

  if (
    receiptValidation?.isBlurry &&
    receiptValidation.confidence >= 0.75 &&
    !receiptSignals.hasStrongReceiptSignals
  ) {
    throw new CustomError(BLURRY_RECEIPT_MESSAGE, 422);
  }

  if (
    receiptValidation &&
    !receiptValidation.isReceipt &&
    receiptValidation.confidence >= 0.75 &&
    !receiptSignals.hasStrongReceiptSignals
  ) {
    throw new CustomError(NOT_RECEIPT_MESSAGE, 422);
  }

  if (
    !receiptSignals.hasStrongReceiptSignals &&
    !extractedHasFields &&
    hasVeryLowOcrQuality
  ) {
    throw new CustomError(NOT_RECEIPT_MESSAGE, 422);
  }

  parsed = normalizeParsedReceipt(parsed, rawText);
  ensureHasExtractedFields(parsed);

  const imageUrl = await uploadImageToCloudinary(file, "receipts", userId);

  return {
    success: true,
    data: parsed,
    rawText,
    imageUrl,
    proUsage
  };
};
