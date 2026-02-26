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
exports.deleteCategory = exports.updateCategory = exports.addCategory = exports.getCategoryById = exports.getCategory = void 0;
const categoryService = __importStar(require("./category.service"));
const getCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { categories, totalCount } = await categoryService.getCategory({
            userId,
            ...req.query
        });
        return res.status(200).json({ data: categories, totalCount });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCategory = getCategory;
const getCategoryById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { data } = await categoryService.getCategoryById({ id, userId });
        return res.status(200).json({ data });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCategoryById = getCategoryById;
const addCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { data } = await categoryService.addCategory({ ...req.body, userId });
        return res.status(201).json({ data });
    }
    catch (error) {
        return next(error);
    }
};
exports.addCategory = addCategory;
const updateCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { data } = await categoryService.updateCategory({
            id,
            userId,
            ...req.body
        });
        return res.status(200).json({ data });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        await categoryService.deleteCategory({ id, userId });
        return res.sendStatus(204);
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteCategory = deleteCategory;
