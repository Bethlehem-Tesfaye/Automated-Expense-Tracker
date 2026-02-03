export type AddExpenseInput = {
  userId: string;
  amount: number;
  merchant: string;
  categoryId: string;
};
export type UpdateExpenseInput = {
  id: string;
  userId: string;
  amount?: number;
  merchant?: string;
  categoryId?: string;
};
export type DeleteExpenseType = {
  id: string;
  userId: string;
};

export type GetExpenseType = {
  userId: string;
  limit?: number;
  offset?: number;
  search?: string;
  categoryName?: string;
  from?: Date;
  to?: Date;
};

export type GetExpenseByIdType = {
  id: string;
  userId: string;
};
