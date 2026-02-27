import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authClient } from "../../../lib/authClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/axios";

interface ProfileCompletionResponse {
  data: {
    isComplete: boolean;
  };
}

interface LoginInput {
  email: string;
  password: string;
}

interface LoginUser {
  id: string;
  email: string;
  name?: string;
  // add other fields if needed
}

interface LoginResponse {
  user: LoginUser;
  // add other fields from your API if needed
}

interface UseLoginResult {
  login: (input: LoginInput) => Promise<LoginResponse>;
  isLoading: boolean;
  error: Error | null;
  data: LoginResponse | undefined;
}

export const useLogin = (): UseLoginResult => {
  const navigate = useNavigate();

  const mutation: UseMutationResult<LoginResponse, Error, LoginInput> =
    useMutation({
      mutationFn: async ({ email, password }: LoginInput) => {
        const res = await authClient.signIn.email({ email, password });

        if (res.error) throw new Error(res.error.message);
        return res.data;
      },
      onSuccess: async (data) => {
        toast.success(`Welcome back, ${data.user.email}!`);

        try {
          const profileResponse =
            await api.get<ProfileCompletionResponse>("/api/profile/me");

          if (profileResponse.data.data.isComplete) {
            navigate("/dashboard");
            return;
          }

          navigate("/profile");
        } catch {
          navigate("/profile");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Login failed, try again");
      },
    });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
