import type { ParsedReceipt } from "./gemini";

type VeryfiDocument = {
  vendor?: { name?: string } | string;
  vendor_name?: string;
  total?: number | string;
  grand_total?: number | string;
  subtotal?: number | string;
  date?: string;
  category?: string;
  categories?: string[];
  line_items?: Array<{ description?: string }>;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return null;
};

const toIsoDate = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  const ymd = trimmed.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  }

  const mdy = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mdy) {
    return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

const pickBestCandidateCategory = (
  text: string,
  candidateCategories: string[]
): string | null => {
  if (!candidateCategories.length) {
    return null;
  }

  const normalizedText = text.toLowerCase();

  const exact = candidateCategories.find(
    (category) => category.trim().toLowerCase() === normalizedText
  );
  if (exact) {
    return exact;
  }

  const included = candidateCategories.find((category) => {
    const normalizedCategory = category.trim().toLowerCase();
    return (
      normalizedText.includes(normalizedCategory) ||
      normalizedCategory.includes(normalizedText)
    );
  });

  if (included) {
    return included;
  }

  return (
    candidateCategories.find((category) =>
      normalizedText.includes(category.trim().toLowerCase())
    ) ?? null
  );
};

const mapVeryfiDocument = (
  document: VeryfiDocument,
  candidateCategories: string[]
): ParsedReceipt | null => {
  const merchant =
    document.vendor_name?.trim() ||
    (typeof document.vendor === "string"
      ? document.vendor.trim()
      : document.vendor?.name?.trim()) ||
    null;

  const amount =
    toNumber(document.total) ??
    toNumber(document.grand_total) ??
    toNumber(document.subtotal);

  const date = toIsoDate(document.date);

  const topCategoryText =
    document.category?.trim() ||
    document.categories?.find(Boolean)?.trim() ||
    "";

  const lineItemText = (document.line_items ?? [])
    .map((item) => item.description?.trim())
    .filter(Boolean)
    .join(" ");

  const matchedCategory = pickBestCandidateCategory(
    `${topCategoryText} ${merchant ?? ""} ${lineItemText}`.trim(),
    candidateCategories
  );

  const category = matchedCategory ?? (topCategoryText || null);

  if (!merchant && amount === null && !date && !category) {
    return null;
  }

  return {
    merchant,
    amount,
    date,
    category
  };
};

export const parseReceiptWithVeryfi = async (
  file: Express.Multer.File,
  candidateCategories: string[] = []
): Promise<ParsedReceipt | null> => {
  const clientId = process.env.VERYFI_CLIENT_ID;
  const username = process.env.VERYFI_USERNAME;
  const apiKey = process.env.VERYFI_API_KEY;

  if (!clientId || !username || !apiKey) {
    throw new Error("Veryfi credentials are missing");
  }

  const payload = {
    file_name: file.originalname,
    file_data: file.buffer.toString("base64")
  };

  const response = await fetch(
    "https://api.veryfi.com/api/v8/partner/documents",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "CLIENT-ID": clientId,
        AUTHORIZATION: `apikey ${username}:${apiKey}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Veryfi request failed: ${response.status} ${errorBody}`);
  }

  const document = (await response.json()) as VeryfiDocument;
  return mapVeryfiDocument(document, candidateCategories);
};
