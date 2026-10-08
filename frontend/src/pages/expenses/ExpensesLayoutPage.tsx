import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../../features/dashboard/components/DashboardHeader";
import DashboardSidebar from "../../features/dashboard/components/DashboardSidebar";

function ExpensesLayoutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default ExpensesLayoutPage;
