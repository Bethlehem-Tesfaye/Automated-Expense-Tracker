import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type {
  ProUsageResponse,
  ReceiptEngine,
  ReceiptProcessResponse,
} from "../types/receipt";

export const useProReceiptUsage = () => {
  return useQuery({
    queryKey: ["receipt", "pro-usage"],
    queryFn: async () => {
      const response = await api.get<ProUsageResponse>(
        "/api/receipt/pro-usage",
      );
      return response.data;
    },
  });
};

export const useProcessReceipt = () => {
  return useMutation({
    mutationFn: async ({
      image,
      engine,
    }: {
      image: File;
      engine: ReceiptEngine;
    }) => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("engine", engine);

      const response = await api.post<ReceiptProcessResponse>(
        "/api/receipt",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message;
      toast.error(message || error.message || "Failed to process receipt");
    },
  });
};
