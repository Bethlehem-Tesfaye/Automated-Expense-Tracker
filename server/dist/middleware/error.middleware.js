"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../config/logger");
function isErrWithStatus(e) {
    return (typeof e === "object" &&
        e !== null &&
        "statusCode" in e &&
        typeof e.statusCode === "number");
}
function extractMessage(e) {
    if (typeof e === "string")
        return e;
    if (typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof e.message === "string") {
        return e.message;
    }
    return "Internal Server Error";
}
function errorHandler(err, _req, res, _next) {
    const statusCode = isErrWithStatus(err) ? err.statusCode : 500;
    logger_1.logger.error({ err });
    res.status(statusCode).json({
        message: extractMessage(err),
        stack: process.env.NODE_ENV === "development" &&
            typeof err === "object" &&
            err !== null &&
            "stack" in err
            ? err.stack
            : undefined
    });
}
