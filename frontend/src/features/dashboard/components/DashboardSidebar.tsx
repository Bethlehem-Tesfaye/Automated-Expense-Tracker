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
  { label: "Settings", icon: Settings },
  { label: "Support", icon: CircleHelp },
];

const itemClass =
  "flex h-10 w-full items-center justify-start gap-3 rounded-md px-3 text-sm font-medium transition-colors";

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
      className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[#BDE8F5] bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center border-b border-[#BDE8F5] px-5">
        <div className="flex items-center gap-3">
          <img
            src={logoIcon as string}
            alt="Expense Tracker logo"
            className="h-8 w-8 object-contain"
          />
          <p className="text-lg font-bold text-[#1C4D8D]">Expense Tracker</p>
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
                    className={({ isActive }) => {
                      const isParentActive =
                        item.label === "Expenses"
                          ? isExpensesRoute
                          : item.label === "Reports"
                            ? isReportsRoute
                            : isActive;

                      return `${itemClass} ${
                        isParentActive
                          ? "bg-[#1C4D8D] text-white"
                          : "text-[#0F2854] hover:bg-[#BDE8F5]"
                      }`;
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </NavLink>

                  {item.label === "Expenses" && (
                    <div className="relative mt-1 space-y-1 pl-8 before:absolute before:bottom-2 before:left-3 before:top-2 before:border-l before:border-dashed before:border-[#94A3B8]">
                      <NavLink
                        to="/expenses/scan"
                        onClick={handleNavigate}
                        className={({ isActive }) =>
                          `relative flex h-8 items-center rounded-md px-2 pl-4 text-xs font-medium before:absolute before:-left-3 before:top-1/2 before:h-px before:w-2 before:-translate-y-1/2 before:bg-[#94A3B8] ${
                            isActive
                              ? "bg-[#BDE8F5] text-[#0F2854]"
                              : "text-[#1C4D8D] hover:bg-[#BDE8F5]/60"
                          }`
                        }
                      >
                        Scan Receipt
                      </NavLink>{" "}
                      <NavLink
                        to="/expenses/add"
                        onClick={handleNavigate}
                        className={({ isActive }) =>
                          `relative flex h-8 items-center rounded-md px-2 pl-4 text-xs font-medium before:absolute before:-left-3 before:top-1/2 before:h-px before:w-2 before:-translate-y-1/2 before:bg-[#94A3B8] ${
                            isActive
                              ? "bg-[#BDE8F5] text-[#0F2854]"
                              : "text-[#1C4D8D] hover:bg-[#BDE8F5]/60"
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
                              ? "bg-[#BDE8F5] text-[#0F2854]"
                              : "text-[#1C4D8D] hover:bg-[#BDE8F5]/60"
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
                  className={`${itemClass} text-[#0F2854] hover:bg-[#BDE8F5]`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <nav className="mt-auto space-y-1.5 border-t border-[#BDE8F5] pt-5">
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                className={`${itemClass} text-[#0F2854] hover:bg-[#BDE8F5]`}
              >
                <Icon size={15} />
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
