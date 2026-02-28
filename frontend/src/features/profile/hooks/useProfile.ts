import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import { queryClient } from "../../../lib/queryClient";
import type {
  GetMyProfileResponse,
  UpdateProfileInput,
} from "../types/profile";

interface UseMyProfileOptions {
  enabled?: boolean;
}

export const useMyProfile = (options?: UseMyProfileOptions) => {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await api.get<GetMyProfileResponse>("/api/profile/me");
      return response.data;
    },
    enabled: options?.enabled,
  });
};

export const useUpdateMyProfile = () => {
  return useMutation({
    mutationFn: async (payload: UpdateProfileInput) => {
      const formData = new FormData();
      formData.append("displayName", payload.displayName);
      formData.append("monthlyBudget", String(payload.monthlyBudget));
      formData.append("monthlyIncome", String(payload.monthlyIncome));
      formData.append("removeAvatar", String(payload.removeAvatar === true));

      if (payload.avatar) {
        formData.append("avatar", payload.avatar);
      }

      const response = await api.put<GetMyProfileResponse>(
        "/api/profile/me",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile saved successfully");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save profile");
    },
  });
};
