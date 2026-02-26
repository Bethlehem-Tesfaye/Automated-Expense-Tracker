import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type { DashboardData } from "../types/dashboard";

interface DashboardOverviewResponse {
  data: DashboardData;
}

export const emptyDashboardData: DashboardData = {
  stats: [],
  categorySpending: [],
  monthlySpending: [],
  weeklySpending: [],
};

export const useDashboardData = (month?: string) => {
  return useQuery({
    queryKey: ["dashboard", "overview", month],
    queryFn: async (): Promise<DashboardData> => {
      const response = await api.get<DashboardOverviewResponse>(
        "/api/dashboard/overview",
        {
          params: month ? { month } : undefined,
        },
      );

      return response.data.data;
    },
    staleTime: 60_000,
  });
};
