"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertMyProfile = exports.getMyProfile = void 0;
const prisma_1 = require("../../lib/prisma");
const toProfileResponse = (profile) => {
    const isComplete = Boolean(profile.displayName?.trim()) &&
        profile.monthlyBudget !== null &&
        profile.monthlyIncome !== null;
    return {
        id: profile.id,
        userId: profile.userId,
        email: profile.user.email,
        name: profile.user.name,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl ?? profile.user.image,
        monthlyBudget: profile.monthlyBudget,
        monthlyIncome: profile.monthlyIncome,
        isComplete
    };
};
const getMyProfile = async (userId) => {
    const profile = await prisma_1.prisma.profile.upsert({
        where: { userId },
        create: { userId },
        update: {},
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    image: true
                }
            }
        }
    });
    return { data: toProfileResponse(profile) };
};
exports.getMyProfile = getMyProfile;
const upsertMyProfile = async ({ userId, displayName, monthlyBudget, monthlyIncome, avatarUrl }) => {
    const updateData = {
        displayName: displayName.trim(),
        monthlyBudget,
        monthlyIncome
    };
    if (avatarUrl !== undefined) {
        updateData.avatarUrl = avatarUrl;
    }
    const createData = {
        userId,
        displayName: displayName.trim(),
        monthlyBudget,
        monthlyIncome
    };
    if (avatarUrl !== undefined) {
        createData.avatarUrl = avatarUrl;
    }
    const profile = await prisma_1.prisma.profile.upsert({
        where: { userId },
        create: createData,
        update: updateData,
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    image: true
                }
            }
        }
    });
    return { data: toProfileResponse(profile) };
};
exports.upsertMyProfile = upsertMyProfile;
