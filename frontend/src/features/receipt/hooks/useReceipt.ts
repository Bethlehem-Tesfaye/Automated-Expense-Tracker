import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { ReceiptEngine, ReceiptProcessResponse } from "../types/receipt";

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
      toast.error(error.message || "Failed to process receipt");
    },
  });
};
