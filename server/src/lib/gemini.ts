import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type ParsedReceipt = {
  merchant: string | null;
  amount: number | null;
  date: string | null; // "YYYY-MM-DD"
  category: string | null;
};

function filterReceiptText(rawText: string) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean); // remove empty lines

  // Simple version: keep everything non-empty to preserve context.
  // You can later drop obviously useless lines if needed.
  return lines.join("\n");
}

/**
 * @param text OCR text
 * @param candidateCategories existing categories from your app (e.g. ["Groceries", "Transport", ...])
 */
export async function parseReceiptWithGemini(
  text: string,
  candidateCategories: string[] = []
): Promise<ParsedReceipt | null> {
  const filteredText = filterReceiptText(text);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const categoriesPrompt = candidateCategories.length
    ? `You MUST choose the category from this exact list when it clearly fits: ${candidateCategories.join(
        ", "
      )}. If none fits at all, then return null for "category".`
    : `Choose the closest category from: Food, Groceries, Transport, Shopping, Utilities, Entertainment, Health, Education, Travel, Subscriptions, Bills, Home. If you are not sure, return null for "category".`;

  const prompt = `
You are classifying a purchase receipt into one expense category.

${categoriesPrompt}

Rules:
- Milk, groceries, food items, supermarket items (e.g. TESCO, Walmart, Carrefour, Aldi, Lidl, Sainsbury) → "Groceries" or "Food", NOT "Transport".
- Gas station fuel, Uber, taxi, bus, train, metro → "Transport".
- If it's clearly a supermarket receipt with food or household items, prefer "Groceries".
- If you are not sure, set "category" to null instead of guessing.

Focus on the purchased items (ignore addresses, loyalty points, long IDs, or marketing text).

Return ONLY valid JSON:
{
  "merchant": string | null,
  "amount": number | null,
  "date": "YYYY-MM-DD" | null,
  "category": string | null
}

Receipt text:
${filteredText}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

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
