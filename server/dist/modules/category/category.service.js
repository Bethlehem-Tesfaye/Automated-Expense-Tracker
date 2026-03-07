"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategory = exports.addCategory = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const errors_1 = __importDefault(require("../../lib/errors"));
const addCategory = async ({ userId, name }) => {
    const existing = await prisma_1.prisma.category.findFirst({
        where: { name, userId }
    });
    if (existing && existing.deletedAt === null) {
        throw new errors_1.default("Category already exists", 409);
    }
    if (existing && existing.deletedAt !== null) {
        const restoredCategory = await prisma_1.prisma.category.update({
            where: { id: existing.id },
            data: { deletedAt: null }
        });
        return { data: restoredCategory };
    }
    try {
        const category = await prisma_1.prisma.category.create({
            data: { name, userId }
        });
        return { data: category };
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            throw new errors_1.default("Category already exists", 409);
        }
        throw error;
    }
};
exports.addCategory = addCategory;
const getCategory = async ({ userId, limit = 20, offset = 0, search }) => {
    const whereCondition = {
        userId,
        deletedAt: null
    };
    if (search) {
        whereCondition.name = {
            contains: search,
            mode: "insensitive"
        };
    }
    const categories = await prisma_1.prisma.category.findMany({
        where: whereCondition,
        skip: Number(offset),
        take: Number(limit),
        orderBy: { name: "asc" }
    });
    const totalCount = await prisma_1.prisma.category.count({ where: whereCondition });
    return { categories, totalCount };
};
exports.getCategory = getCategory;
const getCategoryById = async ({ id, userId }) => {
    const category = await prisma_1.prisma.category.findFirst({
        where: { id, userId, deletedAt: null }
    });
    if (!category)
        throw new errors_1.default("Category not found", 404);
    return { data: category };
};
exports.getCategoryById = getCategoryById;
const updateCategory = async ({ id, userId, name }) => {
    const existing = await prisma_1.prisma.category.findFirst({
        where: { id, userId, deletedAt: null }
    });
    if (!existing)
        throw new errors_1.default("Category not found", 404);
    let updated;
    try {
        updated = await prisma_1.prisma.category.update({
            where: { id },
            data: { name }
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            throw new errors_1.default("Category already exists", 409);
        }
        throw error;
    }
    return { data: updated };
};
exports.updateCategory = updateCategory;
const deleteCategory = async ({ id, userId }) => {
    const existing = await prisma_1.prisma.category.findFirst({
        where: { id, userId, deletedAt: null }
    });
    if (!existing)
        throw new errors_1.default("Category not found or already deleted", 404);
    await prisma_1.prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return { success: true };
};
exports.deleteCategory = deleteCategory;
