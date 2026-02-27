import { parseReceiptWithGemini, type ParsedReceipt } from "../../lib/gemini";
import { parseReceiptWithVeryfi } from "../../lib/veryfi";
import { extractTextFromBuffer } from "../../lib/ocr";
import { uploadImageToCloudinary } from "../../middleware/upload";
import { prisma } from "../../lib/prisma";
import { logger } from "../../config/logger";
import type { ProcessReceiptInput, ProcessReceiptResult } from "./types";

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
  const imageUrl = await uploadImageToCloudinary(file, "receipts", userId);

  const candidateCategories = userId
    ? (
        await prisma.category.findMany({
          where: { userId, deletedAt: null },
          select: { name: true }
        })
      ).map((category) => category.name)
    : [];

  if (engine === "pro") {
    try {
      const parsedWithVeryfi = await parseReceiptWithVeryfi(
        file,
        candidateCategories
      );

      return {
        success: true,
        data: parsedWithVeryfi,
        rawText: "",
        imageUrl
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
        imageUrl
      };
    }
  }

  const rawText = await extractTextFromBuffer(file.buffer);
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

  return {
    success: true,
    data: parsed,
    rawText,
    imageUrl
  };
};
