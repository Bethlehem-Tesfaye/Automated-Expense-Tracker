"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../config/logger");
const mailer_1 = require("../lib/mailer");
const emailRouter = express_1.default.Router();
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function textToHtml(text) {
    return `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>`;
}
emailRouter.post("/api/send-email", express_1.default.json(), async (req, res) => {
    const { to, subject, html, text, type } = req.body;
    const finalHtml = html ?? (text ? textToHtml(text) : undefined);
    if (!to || !subject || !finalHtml) {
        return res
            .status(400)
            .json({ error: "to, subject and html/text are required" });
    }
    try {
        await (0, mailer_1.sendMail)({ to, subject, html: finalHtml });
        logger_1.logger.info({ to, type }, "Email sent via /api/send-email");
        return res.status(200).json({ ok: true });
    }
    catch (err) {
        logger_1.logger.error({ err }, "Failed to send email from /api/send-email");
        return res.status(500).json({ error: "Failed to send email" });
    }
});
exports.default = emailRouter;
