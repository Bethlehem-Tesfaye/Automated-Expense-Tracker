export interface StatCardData {
  title: string;
  value: string;
  trend: string;
  description: string;
  trendTone: "positive" | "negative" | "neutral";
}

export interface CategorySpendingData {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlySpendingData {
  month: string;
  amount: number;
}

export interface WeeklySpendingData {
  day: string;
  amount: number;
}

export interface DashboardData {
  stats: StatCardData[];
  categorySpending: CategorySpendingData[];
  monthlySpending: MonthlySpendingData[];
  weeklySpending: WeeklySpendingData[];
}
