"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromBuffer = extractTextFromBuffer;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
async function extractTextFromBuffer(buffer) {
    const { data } = await tesseract_js_1.default.recognize(buffer, "eng");
    return data.text;
}
