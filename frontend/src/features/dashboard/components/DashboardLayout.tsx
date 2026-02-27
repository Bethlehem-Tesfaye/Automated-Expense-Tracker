import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import OverviewCards from "./OverviewCards";
import MonthlyTrendCard from "./MonthlyTrendCard";
import SpendingByCategoryCard from "./SpendingByCategoryCard";
import WeeklyOverviewCard from "./WeeklyOverviewCard";
import DashboardSkeleton from "./DashboardSkeleton";
import {
  emptyDashboardData,
  useDashboardData,
} from "../hooks/useDashboardData";

function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data, isLoading, isError, error } = useDashboardData();

  const { stats, categorySpending, monthlySpending, weeklySpending } =
    data ?? emptyDashboardData;

  return (
    <div className="h-screen overflow-hidden bg-gray-100 text-[#0F2854]">
      {isMobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="mx-auto flex h-full max-w-375 border-x border-[#BDE8F5] bg-white">
        <DashboardSidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader
            onToggleMenu={() => setIsMobileMenuOpen((current) => !current)}
          />

          <main className="flex-1 space-y-5 overflow-y-auto bg-gray-50 p-5">
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <>
                {isError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Failed to load dashboard data.
                    {error instanceof Error ? ` ${error.message}` : ""}
                  </div>
                )}

                <section>
                  <h1 className="text-3xl font-bold text-[#0F2854]">
                    Expense Overview
                  </h1>
                </section>

                <OverviewCards items={stats} />

                <section className="grid gap-5 xl:grid-cols-2">
                  <SpendingByCategoryCard items={categorySpending} />
                  <MonthlyTrendCard items={monthlySpending} />
                </section>

                <WeeklyOverviewCard items={weeklySpending} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
