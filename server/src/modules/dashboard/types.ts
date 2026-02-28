export type TrendTone = "positive" | "negative" | "neutral";

export interface DashboardStat {
  title: string;
  value: string;
  trend: string;
  description: string;
  trendTone: TrendTone;
}

export interface DashboardCategorySpending {
  category: string;
  amount: number;
  color: string;
}

export interface DashboardMonthlySpending {
  month: string;
  amount: number;
}

export interface DashboardWeeklySpending {
  day: string;
  amount: number;
}

export interface DashboardOverviewData {
  stats: DashboardStat[];
  categorySpending: DashboardCategorySpending[];
  monthlySpending: DashboardMonthlySpending[];
  weeklySpending: DashboardWeeklySpending[];
}
