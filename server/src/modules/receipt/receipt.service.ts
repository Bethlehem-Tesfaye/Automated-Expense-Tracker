import { parseReceiptWithGemini, type ParsedReceipt } from "../../lib/gemini";
import { parseReceiptWithVeryfi } from "../../lib/veryfi";
import { extractTextFromBuffer } from "../../lib/ocr";
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

  if (!parsed.merchant && !parsed.amount && !parsed.date) {
    return null;
  }

  return parsed;
};

const guessCategoryFromText = (text: string): string | null => {
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

const normalizeParsedReceipt = (
  parsed: ParsedReceipt | null,
  rawText: string
): ParsedReceipt | null => {
  if (!parsed) return null;

  const normalizedDate = parsed.date
    ? (toIsoDate(parsed.date) ?? parsed.date)
    : null;
  const normalizedCategory = parsed.category?.trim() || null;

  const category =
    !normalizedCategory || /^other$/i.test(normalizedCategory)
      ? (guessCategoryFromText(rawText) ?? normalizedCategory ?? "Other")
      : normalizedCategory;

  return {
    merchant: parsed.merchant?.trim() || null,
    amount: parsed.amount,
    date: normalizedDate,
    category
  };
};

export const processReceipt = async ({
  file,
  userId,
  engine
}: ProcessReceiptInput): Promise<ProcessReceiptResult> => {
  const effectiveUserId = userId;

  if (!effectiveUserId) {
    throw new CustomError("Unauthorized", 401);
  }

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

      const rawText = await extractTextFromBuffer(file.buffer);
      const parsedWithFallback = normalizeParsedReceipt(
        fallbackParseReceipt(rawText),
        rawText
      );

      return {
        success: true,
        data: parsedWithFallback,
        rawText,
        imageUrl,
        proUsage
      };
    }
  }

  const rawText = await extractTextFromBuffer(file.buffer);
  logger.info(
    {
      engine: "basic",
      userId: effectiveUserId,
      ocrText: rawText
    },
    "Basic OCR extracted text"
  );
  let parsed: ParsedReceipt | null = null;

  try {
    parsed = await parseReceiptWithGemini(rawText, candidateCategories);
  } catch {
    parsed = null;
  }

  if (!parsed) {
    parsed = fallbackParseReceipt(rawText);
  }

  parsed = normalizeParsedReceipt(parsed, rawText);

  const imageUrl = await uploadImageToCloudinary(file, "receipts", userId);

  return {
    success: true,
    data: parsed,
    rawText,
    imageUrl,
    proUsage
  };
};
