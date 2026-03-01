"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertMyProfile = exports.getMyProfile = void 0;
const profileService = __importStar(require("./profile.service"));
const upload_1 = require("../../middleware/upload");
const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const profile = await profileService.getMyProfile(userId);
        return res.status(200).json(profile);
    }
    catch (error) {
        return next(error);
    }
};
exports.getMyProfile = getMyProfile;
const upsertMyProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const removeAvatar = req.body.removeAvatar === true;
        const uploadedAvatarUrl = req.file
            ? await (0, upload_1.uploadImageToCloudinary)(req.file, "expense-tracker/profile", userId)
            : undefined;
        const bodyAvatarUrl = typeof req.body.avatarUrl === "string" && req.body.avatarUrl.trim()
            ? req.body.avatarUrl.trim()
            : undefined;
        const profile = await profileService.upsertMyProfile({
            userId,
            displayName: String(req.body.displayName),
            monthlyBudget: Number(req.body.monthlyBudget),
            monthlyIncome: Number(req.body.monthlyIncome),
            avatarUrl: removeAvatar ? null : (uploadedAvatarUrl ?? bodyAvatarUrl),
            removeAvatar
        });
        return res.status(200).json(profile);
    }
    catch (error) {
        return next(error);
    }
};
exports.upsertMyProfile = upsertMyProfile;
