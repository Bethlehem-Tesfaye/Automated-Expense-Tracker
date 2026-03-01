"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupportRequestStatus = exports.getAllSupportRequests = exports.getSupportRequests = exports.createSupportRequest = exports.getSupportResources = void 0;
const prisma_1 = require("../../lib/prisma");
const errors_1 = __importDefault(require("../../lib/errors"));
const supportResources = [
    {
        id: "faq-1",
        title: "Receipt scan not filling fields",
        description: "Try a clearer image and switch to Pro engine in Settings for higher OCR accuracy."
    },
    {
        id: "faq-2",
        title: "Reports look empty",
        description: "Check your selected period and confirm expenses exist in that date range."
    },
    {
        id: "faq-3",
        title: "Currency mismatch",
        description: "Update Default Currency in Settings and refresh to apply formatting everywhere."
    }
];
const getSupportResources = async () => {
    return { data: supportResources };
};
exports.getSupportResources = getSupportResources;
const createSupportRequest = async ({ userId, subject, message, category }) => {
    const supportRequest = await prisma_1.prisma.supportRequest.create({
        data: {
            userId,
            subject: subject.trim(),
            message: message.trim(),
            category
        },
        select: {
            id: true,
            subject: true,
            category: true,
            status: true,
            createdAt: true
        }
    });
    return { data: supportRequest };
};
exports.createSupportRequest = createSupportRequest;
const getSupportRequests = async ({ userId, limit = 10 }) => {
    const requests = await prisma_1.prisma.supportRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        select: {
            id: true,
            subject: true,
            category: true,
            status: true,
            createdAt: true
        }
    });
    return { data: requests };
};
exports.getSupportRequests = getSupportRequests;
const getAllSupportRequests = async ({ limit = 20, status }) => {
    const requests = await prisma_1.prisma.supportRequest.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        select: {
            id: true,
            subject: true,
            message: true,
            category: true,
            status: true,
            createdAt: true,
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
    return {
        data: requests.map((request) => ({
            id: request.id,
            subject: request.subject,
            message: request.message,
            category: request.category,
            status: request.status,
            createdAt: request.createdAt,
            userName: request.user.name,
            userEmail: request.user.email
        }))
    };
};
exports.getAllSupportRequests = getAllSupportRequests;
const updateSupportRequestStatus = async ({ id, status }) => {
    const existing = await prisma_1.prisma.supportRequest.findUnique({ where: { id } });
    if (!existing) {
        throw new errors_1.default("Support request not found", 404);
    }
    const updated = await prisma_1.prisma.supportRequest.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            subject: true,
            category: true,
            status: true,
            createdAt: true
        }
    });
    return { data: updated };
};
exports.updateSupportRequestStatus = updateSupportRequestStatus;
