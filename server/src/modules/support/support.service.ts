import { prisma } from "../../lib/prisma";
import CustomError from "../../lib/errors";
import type {
  CreateSupportRequestInput,
  GetAllSupportRequestsInput,
  GetSupportRequestsInput,
  SupportResourceItem,
  UpdateSupportRequestStatusInput
} from "./types";

const supportResources: SupportResourceItem[] = [
  {
    id: "faq-1",
    title: "Receipt scan not filling fields",
    description:
      "Try a clearer image and switch to Pro engine in Settings for higher OCR accuracy."
  },
  {
    id: "faq-2",
    title: "Reports look empty",
    description:
      "Check your selected period and confirm expenses exist in that date range."
  },
  {
    id: "faq-3",
    title: "Currency mismatch",
    description:
      "Update Default Currency in Settings and refresh to apply formatting everywhere."
  }
];

export const getSupportResources = async () => {
  return { data: supportResources };
};

export const createSupportRequest = async ({
  userId,
  subject,
  message,
  category
}: CreateSupportRequestInput) => {
  const supportRequest = await prisma.supportRequest.create({
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

export const getSupportRequests = async ({
  userId,
  limit = 10
}: GetSupportRequestsInput) => {
  const requests = await prisma.supportRequest.findMany({
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

export const getAllSupportRequests = async ({
  limit = 20,
  status
}: GetAllSupportRequestsInput) => {
  const requests = await prisma.supportRequest.findMany({
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

export const updateSupportRequestStatus = async ({
  id,
  status
}: UpdateSupportRequestStatusInput) => {
  const existing = await prisma.supportRequest.findUnique({ where: { id } });

  if (!existing) {
    throw new CustomError("Support request not found", 404);
  }

  const updated = await prisma.supportRequest.update({
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
