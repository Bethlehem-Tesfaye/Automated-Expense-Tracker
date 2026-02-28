import { prisma } from "../../lib/prisma";
import type { ProfileResponse, UpdateProfileInput } from "./types";

const toProfileResponse = (profile: {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  monthlyBudget: number | null;
  monthlyIncome: number | null;
  user: {
    email: string;
    name: string;
    image: string | null;
  };
}): ProfileResponse => {
  const isComplete =
    Boolean(profile.displayName?.trim()) &&
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

export const getMyProfile = async (userId: string) => {
  const profile = await prisma.profile.upsert({
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

export const upsertMyProfile = async ({
  userId,
  displayName,
  monthlyBudget,
  monthlyIncome,
  avatarUrl
}: UpdateProfileInput) => {
  const updateData: {
    displayName: string;
    monthlyBudget: number;
    monthlyIncome: number;
    avatarUrl?: string | null;
  } = {
    displayName: displayName.trim(),
    monthlyBudget,
    monthlyIncome
  };

  if (avatarUrl !== undefined) {
    updateData.avatarUrl = avatarUrl;
  }

  const createData: {
    userId: string;
    displayName: string;
    monthlyBudget: number;
    monthlyIncome: number;
    avatarUrl?: string | null;
  } = {
    userId,
    displayName: displayName.trim(),
    monthlyBudget,
    monthlyIncome
  };

  if (avatarUrl !== undefined) {
    createData.avatarUrl = avatarUrl;
  }

  const profile = await prisma.profile.upsert({
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
