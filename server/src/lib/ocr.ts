// services/ocr/paddle-structured.ts
import { PaddleOcrService } from "ppu-paddle-ocr";
import type { PaddleOcrResult } from "ppu-paddle-ocr";

let paddleService: PaddleOcrService | null = null;
let initializingService: Promise<PaddleOcrService> | null = null;

// Convert Node Buffer to ArrayBuffer
const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  Uint8Array.from(buffer).buffer;

// Singleton initialization
const getPaddleService = async (): Promise<PaddleOcrService> => {
  if (paddleService) return paddleService;
  if (!initializingService) {
    initializingService = (async () => {
      const service = new PaddleOcrService();
      await service.initialize();
      paddleService = service;
      return service;
    })();
  }
  return initializingService;
};

// Escape Markdown table cells
const escapeMarkdownCell = (value: string) =>
  value.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();

// Calculate average confidence per line
const averageConfidence = (line: PaddleOcrResult["lines"][number]) => {
  if (!line.length) return "0.00";
  const sum = line.reduce((acc, item) => acc + item.confidence, 0);
  return (sum / line.length).toFixed(2);
};

// Output structured text and plain text
export interface StructuredOcrText {
  plainText: string;
  structuredText: string;
  averageConfidence: number;
  lineCount: number;
}

export async function extractStructuredTextFromBuffer(
  buffer: Buffer
): Promise<StructuredOcrText> {
  const service = await getPaddleService();
  const result = (await service.recognize(
    toArrayBuffer(buffer)
  )) as PaddleOcrResult;

  const plainText = result.text ?? "";
  const averageConfidenceValue = Number(
    Number.isFinite(result.confidence) ? result.confidence : 0
  );

  const tableRows = result.lines.map((line, index) => {
    const lineText = line
      .map((item) => item.text)
      .join(" ")
      .trim();
    return `| ${index + 1} | ${escapeMarkdownCell(lineText)} | ${averageConfidence(line)} |`;
  });

  const structuredText = [
    "## OCR Extracted Text",
    plainText.trim() || "(No text extracted)",
    "",
    "## OCR Line Table",
    "| Line | Text | Avg Confidence |",
    "| ---: | --- | ---: |",
    ...(tableRows.length ? tableRows : ["| 1 | (No lines extracted) | 0.00 |"])
  ].join("\n");

  return {
    plainText,
    structuredText,
    averageConfidence: averageConfidenceValue,
    lineCount: result.lines.length
  };
}

// Return structured text for Gemini
export async function extractTextForGemini(buffer: Buffer): Promise<string> {
  const { structuredText } = await extractStructuredTextFromBuffer(buffer);
  return structuredText;
}

// Optional: fallback for basic logging
export async function extractPlainTextFromBuffer(
  buffer: Buffer
): Promise<string> {
  const { plainText } = await extractStructuredTextFromBuffer(buffer);
  return plainText;
}
