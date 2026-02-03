import express, { NextFunction, type Request, type Response } from "express";
import * as categoryService from "./category.service";

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { categories, totalCount } = await categoryService.getCategory({
      userId,
      ...req.query
    });
    return res.status(200).json({ data: categories, totalCount });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { data } = await categoryService.getCategoryById({ id, userId });
    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { data } = await categoryService.addCategory({ ...req.body, userId });
    return res.status(201).json({ data });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { data } = await categoryService.updateCategory({
      id,
      userId,
      ...req.body
    });
    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    await categoryService.deleteCategory({ id, userId });
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
