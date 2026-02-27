export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  merchant: string;
  date: string;
  categoryId: string;
  category: ExpenseCategory;
}

export interface GetExpensesResponse {
  data: ExpenseItem[];
  totalCount: number;
}

export interface GetCategoriesResponse {
  data: ExpenseCategory[];
  totalCount: number;
}

export interface AddExpenseInput {
  amount: number;
  merchant: string;
  categoryId: string;
  date?: string;
}

export interface UpdateExpenseInput {
  id: string;
  amount: number;
  merchant: string;
  categoryId: string;
  date?: string;
}
