"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToCloudinary = exports.makeUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../lib/cloudinary");
const makeUploader = (_folder) => {
    const storage = multer_1.default.memoryStorage();
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        }
    });
};
exports.makeUploader = makeUploader;
const uploadImageToCloudinary = async (file, folder, userId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder,
            public_id: `${Date.now()}-${userId ?? "anonymous"}`
        }, (error, result) => {
            if (error || !result?.secure_url) {
                reject(error ?? new Error("Cloudinary upload failed"));
                return;
            }
            resolve(result.secure_url);
        });
        uploadStream.end(file.buffer);
    });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
