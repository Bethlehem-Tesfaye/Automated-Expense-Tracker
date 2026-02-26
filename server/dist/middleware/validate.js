"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = __importDefault(require("../lib/errors"));
const validate = (schema, target = "body") => (req, _res, next) => {
    try {
        const data = req[target];
        schema.parse(data);
        next();
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            const message = err.issues.map((issue) => issue.message).join(", ");
            next(new errors_1.default(message, 400));
        }
        else {
            next(new errors_1.default("Invalid request data", 400));
        }
    }
};
exports.validate = validate;
