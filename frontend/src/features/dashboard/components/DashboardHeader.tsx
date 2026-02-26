import { Bell, MessageSquare } from "lucide-react";

function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#BDE8F5] bg-white px-5">
      <input
        type="text"
        placeholder="Search expenses..."
        className="w-full max-w-xs rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
      />

      <div className="ml-4 flex items-center gap-4">
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
