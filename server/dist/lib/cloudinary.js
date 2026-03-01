"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const logger_1 = require("../config/logger");
const environments_1 = require("../config/environments");
const cloudinaryConfig = {
    cloud_name: environments_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: environments_1.env.CLOUDINARY_API_KEY,
    api_secret: environments_1.env.CLOUDINARY_API_SECRET
};
cloudinary_1.v2.config(cloudinaryConfig);
const hasValidConfig = !!cloudinaryConfig.cloud_name &&
    !!cloudinaryConfig.api_key &&
    !!cloudinaryConfig.api_secret;
if (!hasValidConfig) {
    logger_1.logger.warn("Cloudinary credentials not set (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)");
}
else {
    (async () => {
        try {
            if (typeof cloudinary_1.v2.api?.ping === "function") {
                await cloudinary_1.v2.api.ping();
            }
            else {
                await cloudinary_1.v2.api.resources({ max_results: 1 });
            }
            logger_1.logger.info("Cloudinary connected and reachable");
        }
        catch (err) {
            logger_1.logger.error({
                err
            }, "Cloudinary connection failed");
        }
    })();
}
