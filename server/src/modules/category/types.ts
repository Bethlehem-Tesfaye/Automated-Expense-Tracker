export type AddCategoryInput = {
  userId: string;
  name: string;
};

export type UpdateCategoryInput = {
  id: string;
  userId: string;
  name: string;
};

export type DeleteCategoryType = {
  id: string;
  userId: string;
};

export type GetCategoryByIdType = {
  id: string;
  userId: string;
};

export type GetCategoryType = {
  userId: string;
  limit?: number;
  offset?: number;
  search?: string;
};
