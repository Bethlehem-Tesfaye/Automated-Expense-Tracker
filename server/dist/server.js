"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./lib/cloudinary");
const app_1 = __importDefault(require("./config/app"));
const logger_1 = require("./config/logger");
const environments_1 = require("./config/environments");
const db_1 = __importDefault(require("./config/db"));
const PORT = Number(environments_1.env.PORT) || 5000;
db_1.default
    .query("SELECT 1")
    .then(() => {
    logger_1.logger.info("database connected");
    app_1.default.listen(PORT, () => {
        logger_1.logger.info(`Server running on port:${PORT}`);
    });
})
    .catch(() => {
    logger_1.logger.error("database connection failed");
});
