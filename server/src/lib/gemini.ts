import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type ParsedReceipt = {
  merchant: string | null;
  amount: number | null;
  date: string | null; // "YYYY-MM-DD"
  category: string | null;
};

export type ReceiptValidationResult = {
  isReceipt: boolean;
  confidence: number;
  isBlurry: boolean;
  reason: string;
};

/**
 * Cleans OCR text and removes empty lines
 */
function filterReceiptText(rawText: string) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.join("\n");
}

/**
 * Parse receipt using Gemini LLM
 * @param text OCR text
 * @param candidateCategories optional user-specific categories
 */
export async function parseReceiptWithGemini(
  text: string,
  candidateCategories: string[] = []
): Promise<ParsedReceipt | null> {
  const filteredText = filterReceiptText(text);

  const categoriesPrompt = candidateCategories.length
    ? `You MUST choose the category from this exact list when it clearly fits: ${candidateCategories.join(
        ", "
      )}. If none fits, return null for "category".`
    : `Choose the closest category from: Food, Groceries, Transport, Shopping, Utilities, Entertainment, Health, Education, Travel, Subscriptions, Bills, Home. If you are not sure, return null for "category".`;

  // 🔥 New defensive prompt
  const prompt = `
You are an expense classification engine.

Your job:
Extract structured receipt data and classify it into ONE expense category.

CRITICAL INSTRUCTIONS:

1) Classify ONLY based on purchased items.so first extract the those you think are items and analaysie those items and only using those items can u decided the category of the recipt so do not ever use anything outside the items to define the category in any situation
2) IGNORE:
   - Phone numbers
   - Fax numbers
   - Addresses
   - Website URLs
   - Marketing text
   - Order numbers
   - Table numbers
3) Do NOT classify based on headers or contact information.
4) If food or drink items appear, you MUST return "Food".
5) If the receipt is clearly a supermarket with groceries, prefer "Groceries".
6) If unsure, return null for "category" instead of guessing.

Food examples (always classify as "Food"):
tea, coffee, salad, cake, pizza, burger, sandwich, drink, cafe, restaurant, bakery, meal.

Transport examples:
fuel, gas station, uber, taxi, bus, train, metro.

Utilities examples:
electric bill, water bill, internet bill, phone bill, utility payment.

${categoriesPrompt}

Return ONLY valid JSON in this exact format:

{
  "merchant": string | null,
  "amount": number | null,
  "date": "YYYY-MM-DD" | null,
  "category": string | null
}

Rules for extraction:
- "merchant" = business name at top of receipt.
- "amount" = FINAL total amount paid (not subtotal, not tax).
- "date" = purchase date in YYYY-MM-DD format.
- If a field cannot be confidently determined, return null.

Receipt text:
${filteredText}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    // Remove ```json blocks if present
    const normalized = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(normalized);
  } catch {
    return null;
  }
}

export async function validateReceiptWithGemini(
  text: string
): Promise<ReceiptValidationResult | null> {
  const filteredText = filterReceiptText(text);

  const prompt = `
You are validating OCR output quality.

Task:
1) Decide if the OCR text is from a real purchase receipt.
2) Decide if the text appears too blurry/noisy/garbled to trust.

Return ONLY JSON in this exact shape:
{
  "isReceipt": boolean,
  "confidence": number,
  "isBlurry": boolean,
  "reason": string
}

Rules:
- confidence must be between 0 and 1.
- isReceipt=false when text clearly looks like non-receipt content (notes, random text, posters, labels, etc.)
- isBlurry=true when text quality is too poor/garbled/incomplete for reliable extraction.
- Use short reason (max 20 words).

OCR text:
${filteredText}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    const normalized = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(normalized) as ReceiptValidationResult;

    if (
      typeof parsed?.isReceipt !== "boolean" ||
      typeof parsed?.isBlurry !== "boolean" ||
      typeof parsed?.reason !== "string"
    ) {
      return null;
    }

    const confidence = Number(parsed.confidence);

    return {
      isReceipt: parsed.isReceipt,
      isBlurry: parsed.isBlurry,
      reason: parsed.reason,
      confidence: Number.isFinite(confidence)
        ? Math.min(1, Math.max(0, confidence))
        : 0
    };
  } catch {
    return null;
  }
}
