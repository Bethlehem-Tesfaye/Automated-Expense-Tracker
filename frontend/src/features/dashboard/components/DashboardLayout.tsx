import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardOnboardingTour from "./DashboardOnboardingTour";
import OverviewCards from "./OverviewCards";
import MonthlyTrendCard from "./MonthlyTrendCard";
import SpendingByCategoryCard from "./SpendingByCategoryCard";
import WeeklyOverviewCard from "./WeeklyOverviewCard";
import DashboardSkeleton from "./DashboardSkeleton";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import {
  emptyDashboardData,
  useDashboardData,
} from "../hooks/useDashboardData";

function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { user } = useCurrentUser();
  const { data, isLoading, isError, error } = useDashboardData();

  const { stats, categorySpending, monthlySpending, weeklySpending } =
    data ?? emptyDashboardData;

  const hasAnyExpenses =
    categorySpending.length > 0 ||
    monthlySpending.some((item) => item.amount > 0) ||
    weeklySpending.some((item) => item.amount > 0);

  const tourSteps = useMemo(
    () => [
      {
        targetId: "profile-icon",
        title: "Profile & Settings",
        description: "Here you can edit your profile.",
      },
      {
        targetId: "scan-receipt-link",
        title: "Scan Receipt",
        description:
          "Scan receipts and we will automatically extract the expense.",
      },
      {
        targetId: "add-expense-link",
        title: "Add Expense",
        description: "Manually add expenses if you don't have a receipt.",
      },
      {
        targetId: "reports-link",
        title: "Reports",
        description: "View your custom report here.",
      },
    ],
    [],
  );

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    const doneKey = `onboarding:done:${userId}`;
    const pendingKey = `onboarding:pending:${userId}`;
    const socialRegisterPending =
      localStorage.getItem("onboarding:social-register-pending") === "true";

    if (socialRegisterPending) {
      localStorage.setItem(pendingKey, "true");
      localStorage.removeItem("onboarding:social-register-pending");
    }

    const isDone = localStorage.getItem(doneKey) === "true";
    const isPending = localStorage.getItem(pendingKey) === "true";

    if (isPending && !isDone) {
      setIsTourOpen(true);
    }
  }, [user?.id]);

  const handleTourFinish = () => {
    const userId = user?.id;
    if (userId) {
      localStorage.setItem(`onboarding:done:${userId}`, "true");
      localStorage.removeItem(`onboarding:pending:${userId}`);
    }

    setIsTourOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-[#0F2854]">
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

                {!hasAnyExpenses && (
                  <section className="rounded-xl border border-[#BDE8F5] bg-white p-5">
                    <p className="text-sm text-[#1C4D8D]">
                      No expenses yet. Upload a receipt or add your first
                      expense.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/expenses/scan"
                        className="inline-flex h-10 items-center rounded-md border border-[#1C4D8D] px-4 text-sm font-semibold text-[#1C4D8D]"
                      >
                        Upload Receipt
                      </Link>
                      <Link
                        to="/expenses/add"
                        className="inline-flex h-10 items-center rounded-md bg-[#1C4D8D] px-4 text-sm font-semibold text-white"
                      >
                        Add Expense
                      </Link>
                    </div>
                  </section>
                )}

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

      <DashboardOnboardingTour
        steps={tourSteps}
        isOpen={isTourOpen}
        onFinish={handleTourFinish}
      />
    </div>
  );
}

export default DashboardLayout;
