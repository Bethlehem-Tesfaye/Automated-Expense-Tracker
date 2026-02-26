import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  PieChart,
  Settings,
  CircleHelp,
} from "lucide-react";
import { logoIcon } from "../../../assets";

interface NavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

const mainItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Expenses", icon: Receipt },
  { label: "Reports", icon: BarChart3 },
  { label: "Categories", icon: PieChart },
];

const footerItems: NavItem[] = [
  { label: "Settings", icon: Settings },
  { label: "Support", icon: CircleHelp },
];

const itemClass =
  "flex h-10 w-full items-center justify-start gap-3 rounded-md px-3 text-sm font-medium transition-colors";

function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-[#BDE8F5] lg:bg-white">
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
            return (
              <button
                type="button"
                key={item.label}
                className={`${itemClass} ${
                  item.active
                    ? "bg-[#1C4D8D] text-white"
                    : "text-[#0F2854] hover:bg-[#BDE8F5]"
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
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
