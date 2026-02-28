import { useState } from "react";
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyProfile } from "../../profile/hooks/useProfile";
import { useLogout } from "../../auth/hooks/useLogout";
import { useTheme } from "../../../lib/theme";

interface DashboardHeaderProps {
  onToggleMenu?: () => void;
}

function DashboardHeader({ onToggleMenu }: DashboardHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { data: profileResponse } = useMyProfile();
  const logoutMutation = useLogout();
  const profile = profileResponse?.data;

  const displayName = profile?.displayName || profile?.name || "User";
  const avatarUrl = profile?.avatarUrl || null;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#BDE8F5] bg-[#F3F8FF] text-[#1C4D8D] transition-colors hover:bg-[#EAF3FF] hover:text-[#0F2854]"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-[#F3F8FF]"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#BDE8F5] to-[#4988C4] text-xs font-semibold text-[#0F2854]">
                {initials || "U"}
              </div>
            )}{" "}
            <p className="hidden text-sm font-medium text-[#0F2854] sm:block">
              {displayName}
            </p>
            <ChevronDown size={16} className="text-[#1C4D8D]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-[#D6E6FB] bg-white py-1 shadow-lg">
              <Link
                to="/profile"
                onClick={() => setIsProfileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#0F2854] transition-colors hover:bg-[#F3F8FF]"
              >
                Edit Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logoutMutation.mutate();
                }}
                disabled={logoutMutation.isPending}
                className="block w-full px-3 py-2 text-left text-sm font-medium text-[#0F2854] transition-colors hover:bg-[#F3F8FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
