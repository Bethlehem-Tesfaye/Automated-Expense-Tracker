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

      <div className="flex h-full w-full bg-white">
        <DashboardSidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader
            onToggleMenu={() => setIsMobileMenuOpen((current) => !current)}
          />

          <main className="bento-page flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
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

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <section className="bento-accent flex flex-col justify-between gap-6 p-6 lg:col-span-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                      </p>
                      <h1 className="mt-2 text-3xl font-bold leading-tight">
                        Expense Overview
                      </h1>
                      <p className="mt-2 text-sm text-white/80">
                        {hasAnyExpenses
                          ? "Here is how your spending is shaping up."
                          : "No expenses yet. Upload a receipt or add your first expense."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/expenses/scan"
                        className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#1C4D8D] transition-transform hover:-translate-y-0.5"
                      >
                        Scan Receipt
                      </Link>
                      <Link
                        to="/expenses/add"
                        className="inline-flex h-10 items-center rounded-lg border border-white/40 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        Add Expense
                      </Link>
                    </div>
                  </section>

                  <OverviewCards
                    items={stats}
                    className="lg:col-span-8"
                  />

                  <div className="lg:col-span-5">
                    <SpendingByCategoryCard items={categorySpending} />
                  </div>
                  <div className="lg:col-span-7">
                    <MonthlyTrendCard items={monthlySpending} />
                  </div>
                  <div className="lg:col-span-12">
                    <WeeklyOverviewCard items={weeklySpending} />
                  </div>
                </div>
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
