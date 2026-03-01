"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseAdminEmails = () => (process.env.SUPPORT_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
const supportAdminMiddleware = (req, res, next) => {
    const adminEmails = parseAdminEmails();
    const email = typeof req.user?.email === "string" ? req.user.email.toLowerCase() : "";
    if (!adminEmails.length) {
        return res.status(403).json({
            message: "Support admin is not configured. Set SUPPORT_ADMIN_EMAILS in server environment."
        });
    }
    if (!email || !adminEmails.includes(email)) {
        return res.status(403).json({ message: "Admin access required" });
    }
    return next();
};
exports.default = supportAdminMiddleware;
