import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import CustomError from "../../lib/errors";
import type {
  AddCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryType,
  GetCategoryType,
  GetCategoryByIdType
} from "./types";

export const addCategory = async ({ userId, name }: AddCategoryInput) => {
  const existing = await prisma.category.findFirst({
    where: { name, userId }
  });

  if (existing && existing.deletedAt === null) {
    throw new CustomError("Category already exists", 409);
  }

  if (existing && existing.deletedAt !== null) {
    const restoredCategory = await prisma.category.update({
      where: { id: existing.id },
      data: { deletedAt: null }
    });

    return { data: restoredCategory };
  }

  try {
    const category = await prisma.category.create({
      data: { name, userId }
    });

    return { data: category };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new CustomError("Category already exists", 409);
    }

    throw error;
  }
};

export const getCategory = async ({
  userId,
  limit = 20,
  offset = 0,
  search
}: GetCategoryType) => {
  const whereCondition: Prisma.CategoryWhereInput = {
    userId,
    deletedAt: null
  };

  if (search) {
    whereCondition.name = {
      contains: search,
      mode: "insensitive"
    };
  }

  const categories = await prisma.category.findMany({
    where: whereCondition,
    skip: Number(offset),
    take: Number(limit),
    orderBy: { name: "asc" }
  });

  const totalCount = await prisma.category.count({ where: whereCondition });

  return { categories, totalCount };
};

export const getCategoryById = async ({ id, userId }: GetCategoryByIdType) => {
  const category = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null }
  });

  if (!category) throw new CustomError("Category not found", 404);

  return { data: category };
};

export const updateCategory = async ({
  id,
  userId,
  name
}: UpdateCategoryInput) => {
  const existing = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null }
  });

  if (!existing) throw new CustomError("Category not found", 404);

  let updated;

  try {
    updated = await prisma.category.update({
      where: { id },
      data: { name }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new CustomError("Category already exists", 409);
    }

    throw error;
  }

  return { data: updated };
};

export const deleteCategory = async ({ id, userId }: DeleteCategoryType) => {
  const existing = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null }
  });

  if (!existing)
    throw new CustomError("Category not found or already deleted", 404);

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  return { success: true };
};
