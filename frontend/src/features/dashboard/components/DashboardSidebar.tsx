import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  PieChart,
  Settings,
  CircleHelp,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { logoIcon } from "../../../assets";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path?: string;
}

const mainItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Expenses", icon: Receipt, path: "/expenses/list" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Categories", icon: PieChart, path: "/categories" },
];

const footerItems: NavItem[] = [
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Support", icon: CircleHelp, path: "/support" },
];

const itemClass =
  "flex h-10 w-full items-center justify-start gap-3 rounded-xl px-3 text-sm font-medium transition-all";

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function DashboardSidebar({
  isMobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const location = useLocation();
  const isExpensesRoute = location.pathname.startsWith("/expenses");
  const isReportsRoute = location.pathname.startsWith("/reports");

  const handleNavigate = () => {
    onCloseMobile?.();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E2E8F0] bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center px-5">
        <div className="flex items-center gap-3">
          <img
            src={logoIcon as string}
            alt="Expense Tracker logo"
            className="h-9 w-9 rounded-xl bg-teal-50 object-contain p-1.5"
          />
          <p className="text-lg font-bold text-[#475569]">Expense Tracker</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 py-4">
        <nav className="space-y-1.5">
          {mainItems.map((item) => {
            const Icon = item.icon;

            if (item.path) {
              return (
                <div key={item.label}>
                  <NavLink
                    to={item.path}
                    onClick={handleNavigate}
                    data-tour-id={
                      item.label === "Reports" ? "reports-link" : undefined
                    }
                    className={({ isActive }) => {
                      const isParentActive =
                        item.label === "Expenses"
                          ? isExpensesRoute
                          : item.label === "Reports"
                            ? isReportsRoute
                            : isActive;

                      return `${itemClass} ${
                        isParentActive
                          ? "bg-[#0D9488] text-white shadow-md shadow-teal-500/30"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                      }`;
                    }}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>

                  {item.label === "Expenses" && (
                    <div className="relative mt-1 space-y-1 pl-8 before:absolute before:bottom-2 before:left-3 before:top-2 before:border-l before:border-dashed before:border-[#94A3B8]">
                      <NavLink
                        to="/expenses/scan"
                        onClick={handleNavigate}
                        data-tour-id="scan-receipt-link"
                        className={({ isActive }) =>
                          `relative flex h-8 items-center rounded-md px-2 pl-4 text-xs font-medium before:absolute before:-left-3 before:top-1/2 before:h-px before:w-2 before:-translate-y-1/2 before:bg-[#94A3B8] ${
                            isActive
                              ? "bg-teal-50 font-semibold text-[#0D9488]"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                          }`
                        }
                      >
                        Scan Receipt
                      </NavLink>{" "}
                      <NavLink
                        to="/expenses/add"
                        onClick={handleNavigate}
                        data-tour-id="add-expense-link"
                        className={({ isActive }) =>
                          `relative flex h-8 items-center rounded-md px-2 pl-4 text-xs font-medium before:absolute before:-left-3 before:top-1/2 before:h-px before:w-2 before:-translate-y-1/2 before:bg-[#94A3B8] ${
                            isActive
                              ? "bg-teal-50 font-semibold text-[#0D9488]"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                          }`
                        }
                      >
                        Add Expense
                      </NavLink>
                      <NavLink
                        to="/expenses/list"
                        onClick={handleNavigate}
                        className={({ isActive }) =>
                          `relative flex h-8 items-center rounded-md px-2 pl-4 text-xs font-medium before:absolute before:-left-3 before:top-1/2 before:h-px before:w-2 before:-translate-y-1/2 before:bg-[#94A3B8] ${
                            isActive
                              ? "bg-teal-50 font-semibold text-[#0D9488]"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                          }`
                        }
                      >
                        Expense List
                      </NavLink>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.label}>
                <button
                  type="button"
                  className={`${itemClass} text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <nav className="mt-auto space-y-1.5 border-t border-[#E2E8F0] pt-4">
          {footerItems.map((item) => {
            const Icon = item.icon;

            if (item.path) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={handleNavigate}
                  className={({ isActive }) =>
                    `${itemClass} ${
                      isActive
                        ? "bg-[#0D9488] text-white shadow-md shadow-teal-500/30"
                        : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            return (
              <button
                type="button"
                key={item.label}
                className={`${itemClass} text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
