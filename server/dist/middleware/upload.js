"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUploader = void 0;
const multer_1 = __importDefault(require("multer"));
// @ts-expect-error -- no types available for 'multer-storage-cloudinary'
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("../lib/cloudinary");
const makeUploader = (folder) => {
    const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.cloudinary,
        params: async (req, _file) => ({
            folder,
            public_id: `${Date.now()}-${req.userId ?? "anonymous"}`
        })
    });
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
