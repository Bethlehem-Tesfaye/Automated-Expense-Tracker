import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import { queryClient } from "../../../lib/queryClient";
import type {
  CreateSupportRequestInput,
  CreateSupportRequestResponse,
  GetAdminSupportRequestsResponse,
  GetSupportRequestsResponse,
  GetSupportResourcesResponse,
  SupportStatus,
  UpdateSupportRequestStatusInput,
} from "../types/support";

export const useSupportResources = () => {
  return useQuery({
    queryKey: ["support", "resources"],
    queryFn: async () => {
      const response = await api.get<GetSupportResourcesResponse>(
        "/api/support/resources",
      );

      return response.data;
    },
  });
};

export const useSupportRequests = () => {
  return useQuery({
    queryKey: ["support", "requests"],
    queryFn: async () => {
      const response = await api.get<GetSupportRequestsResponse>(
        "/api/support/requests",
        { params: { limit: 10 } },
      );

      return response.data;
    },
  });
};

export const useCreateSupportRequest = () => {
  return useMutation({
    mutationFn: async (payload: CreateSupportRequestInput) => {
      const response = await api.post<CreateSupportRequestResponse>(
        "/api/support/requests",
        payload,
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Support request submitted");
      queryClient.invalidateQueries({ queryKey: ["support", "requests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit support request");
    },
  });
};

export const useAdminSupportRequests = (status?: SupportStatus) => {
  return useQuery({
    queryKey: ["support", "admin", "requests", status],
    queryFn: async () => {
      const response = await api.get<GetAdminSupportRequestsResponse>(
        "/api/support/admin/requests",
        {
          params: {
            limit: 50,
            ...(status ? { status } : {}),
          },
        },
      );

      return response.data;
    },
  });
};

export const useUpdateSupportRequestStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateSupportRequestStatusInput) => {
      const response = await api.patch(
        `/api/support/admin/requests/${id}/status`,
        { status },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Support request updated");
      queryClient.invalidateQueries({
        queryKey: ["support", "admin", "requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["support", "requests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update request status");
    },
  });
};
