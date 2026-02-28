import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import { queryClient } from "../../../lib/queryClient";
import type {
  AddExpenseInput,
  GetCategoriesResponse,
  GetExpensesResponse,
  UpdateExpenseInput,
} from "../types/expenses";

interface UseExpensesParams {
  limit?: number;
  offset?: number;
  search?: string;
  categoryName?: string;
  from?: string;
  to?: string;
}

export const useExpenses = ({
  limit = 10,
  offset = 0,
  search,
  categoryName,
  from,
  to,
}: UseExpensesParams = {}) => {
  return useQuery({
    queryKey: [
      "expenses",
      "list",
      limit,
      offset,
      search,
      categoryName,
      from,
      to,
    ],
    queryFn: async () => {
      const response = await api.get<GetExpensesResponse>("/api/expenses", {
        params: { limit, offset, search, categoryName, from, to },
      });

      return response.data;
    },
  });
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => {
      const response = await api.get<GetCategoriesResponse>("/api/categories", {
        params: { limit: 100, offset: 0 },
      });

      return response.data;
    },
  });
};

export const useCreateExpense = () => {
  return useMutation({
    mutationFn: async (payload: AddExpenseInput) => {
      const response = await api.post("/api/expenses", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Expense added successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add expense");
    },
  });
};

export const useDeleteExpense = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/expenses/${id}`);
    },
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: ["expenses", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });
};

export const useUpdateExpense = () => {
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateExpenseInput) => {
      const response = await api.put(`/api/expenses/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Expense updated");
      queryClient.invalidateQueries({ queryKey: ["expenses", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });
};
