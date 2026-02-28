import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import { queryClient } from "../../../lib/queryClient";
import type {
  CurrencyCode,
  GetMySettingsResponse,
  UpdateSettingsInput,
} from "../types/settings";

const DEFAULT_CURRENCY: CurrencyCode = "ETB";

export const useMySettings = () => {
  return useQuery({
    queryKey: ["settings", "me"],
    queryFn: async () => {
      const response = await api.get<GetMySettingsResponse>("/api/settings/me");
      return response.data;
    },
  });
};

export const useUpdateMySettings = () => {
  return useMutation({
    mutationFn: async (payload: UpdateSettingsInput) => {
      const response = await api.put<GetMySettingsResponse>(
        "/api/settings/me",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["settings", "me"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });
};

export const useCurrencyFormatter = () => {
  const { data } = useMySettings();

  const currency = (data?.data.defaultCurrency ??
    DEFAULT_CURRENCY) as CurrencyCode;

  const formatMoney = useMemo(
    () => (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value),
    [currency],
  );

  const formatCompactMoney = useMemo(
    () => (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value),
    [currency],
  );

  const currencySymbol = useMemo(() => {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);

    return parts.find((part) => part.type === "currency")?.value ?? currency;
  }, [currency]);

  return {
    currency,
    currencySymbol,
    formatMoney,
    formatCompactMoney,
  };
};
