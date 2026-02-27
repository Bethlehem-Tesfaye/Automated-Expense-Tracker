import { Bell, Menu, MessageSquare } from "lucide-react";

interface DashboardHeaderProps {
  onToggleMenu?: () => void;
}

function DashboardHeader({ onToggleMenu }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#BDE8F5] bg-white px-5">
      <button
        type="button"
        onClick={onToggleMenu}
        className="text-[#1C4D8D] transition-colors hover:text-[#0F2854] lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center justify-end gap-4">
        <button
          type="button"
          className="text-[#1C4D8D] transition-colors hover:text-[#0F2854]"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="text-[#1C4D8D] transition-colors hover:text-[#0F2854]"
        >
          <MessageSquare size={18} />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#BDE8F5] to-[#4988C4] text-xs font-semibold text-[#0F2854]">
          TB
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
