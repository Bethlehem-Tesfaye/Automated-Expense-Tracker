import type { Request, Response, NextFunction } from "express";

const parseAdminEmails = (): string[] =>
  (process.env.SUPPORT_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const supportAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const adminEmails = parseAdminEmails();
  const email =
    typeof req.user?.email === "string" ? req.user.email.toLowerCase() : "";

  if (!adminEmails.length) {
    return res.status(403).json({
      message:
        "Support admin is not configured. Set SUPPORT_ADMIN_EMAILS in server environment."
    });
  }

  if (!email || !adminEmails.includes(email)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};

export default supportAdminMiddleware;
