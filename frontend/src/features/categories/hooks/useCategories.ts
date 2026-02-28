import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import { queryClient } from "../../../lib/queryClient";
import type {
  AddCategoryInput,
  GetCategoriesResponse,
  UpdateCategoryInput,
} from "../types/categories";

interface UseCategoriesParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export const useCategories = ({
  limit = 10,
  offset = 0,
  search,
}: UseCategoriesParams = {}) => {
  return useQuery({
    queryKey: ["categories", "list", limit, offset, search],
    queryFn: async () => {
      const response = await api.get<GetCategoriesResponse>("/api/categories", {
        params: { limit, offset, search },
      });

      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: async (payload: AddCategoryInput) => {
      const response = await api.post("/api/categories", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Category added");
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add category");
    },
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateCategoryInput) => {
      const response = await api.put(`/api/categories/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Category updated");
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
};
