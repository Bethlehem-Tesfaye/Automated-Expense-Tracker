import Tesseract from "tesseract.js";

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, "eng");
  return data.text;
}
