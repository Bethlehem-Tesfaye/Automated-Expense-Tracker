"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStructuredTextFromBuffer = extractStructuredTextFromBuffer;
exports.extractTextForGemini = extractTextForGemini;
exports.extractPlainTextFromBuffer = extractPlainTextFromBuffer;
// services/ocr/paddle-structured.ts
const ppu_paddle_ocr_1 = require("ppu-paddle-ocr");
let paddleService = null;
let initializingService = null;
// Convert Node Buffer to ArrayBuffer
const toArrayBuffer = (buffer) => Uint8Array.from(buffer).buffer;
// Singleton initialization
const getPaddleService = async () => {
    if (paddleService)
        return paddleService;
    if (!initializingService) {
        initializingService = (async () => {
            const service = new ppu_paddle_ocr_1.PaddleOcrService();
            await service.initialize();
            paddleService = service;
            return service;
        })();
    }
    return initializingService;
};
// Escape Markdown table cells
const escapeMarkdownCell = (value) => value.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
// Calculate average confidence per line
const averageConfidence = (line) => {
    if (!line.length)
        return "0.00";
    const sum = line.reduce((acc, item) => acc + item.confidence, 0);
    return (sum / line.length).toFixed(2);
};
async function extractStructuredTextFromBuffer(buffer) {
    const service = await getPaddleService();
    const result = (await service.recognize(toArrayBuffer(buffer)));
    const plainText = result.text ?? "";
    const averageConfidenceValue = Number(Number.isFinite(result.confidence) ? result.confidence : 0);
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
async function extractTextForGemini(buffer) {
    const { structuredText } = await extractStructuredTextFromBuffer(buffer);
    return structuredText;
}
// Optional: fallback for basic logging
async function extractPlainTextFromBuffer(buffer) {
    const { plainText } = await extractStructuredTextFromBuffer(buffer);
    return plainText;
}
