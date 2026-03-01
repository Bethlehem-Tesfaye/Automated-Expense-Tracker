"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishEmailJob = publishEmailJob;
const qstash_1 = require("@upstash/qstash");
const logger_1 = require("../config/logger");
const qstash = new qstash_1.Client({
    token: process.env.QSTASH_TOKEN
});
async function publishEmailJob(payload) {
    try {
        const res = await qstash.publishJSON({
            url: process.env.EMAIL_API_URL,
            body: payload
        });
        logger_1.logger.info({
            messageId: res.messageId
        }, "QStash email job published");
        return res;
    }
    catch (err) {
        const message = typeof err === "string"
            ? err
            : err instanceof Error
                ? err.message
                : String(err);
        logger_1.logger.error({
            message
        }, "QStash email publish failed");
        throw err;
    }
}
