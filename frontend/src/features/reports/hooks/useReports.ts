import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type {
  ExpenseReportQuery,
  ExpenseReportResponse,
} from "../types/reports";

export const useExpenseReport = (params: ExpenseReportQuery) => {
  return useQuery({
    queryKey: [
      "reports",
      params.period,
      params.date,
      params.month,
      params.year,
      params.from,
      params.to,
    ],
    queryFn: async () => {
      const response = await api.get<ExpenseReportResponse>(
        "/api/expenses/report",
        {
          params,
        },
      );

      return response.data;
    },
  });
};
