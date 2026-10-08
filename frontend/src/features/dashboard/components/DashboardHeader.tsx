import { useEffect, useState } from "react";
import { ChevronDown, Menu, Moon, Sun, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyProfile } from "../../profile/hooks/useProfile";
import { useLogout } from "../../auth/hooks/useLogout";
import { useTheme } from "../../../lib/theme";

interface DashboardHeaderProps {
  onToggleMenu?: () => void;
}

function DashboardHeader({ onToggleMenu }: DashboardHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAvatarBroken, setIsAvatarBroken] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { data: profileResponse } = useMyProfile();
  const logoutMutation = useLogout();
  const profile = profileResponse?.data;

  const displayName = profile?.displayName || profile?.name || "User";
  const avatarUrl = profile?.avatarUrl;
  const normalizedAvatarUrl =
    typeof avatarUrl === "string" &&
    avatarUrl.trim().length > 0 &&
    avatarUrl !== "null" &&
    avatarUrl !== "undefined"
      ? avatarUrl
      : null;

  useEffect(() => {
    setIsAvatarBroken(false);
  }, [normalizedAvatarUrl]);

  return (
    <header className="nav-glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] px-4 sm:px-6">
      <button
        type="button"
        onClick={onToggleMenu}
        className="text-[#475569] transition-colors hover:text-[#0F172A] lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] transition-colors hover:border-teal-300 hover:text-[#0D9488]"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            data-tour-id="profile-icon"
            className="flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1 transition-colors hover:border-[#E2E8F0] hover:bg-white"
          >
            {normalizedAvatarUrl && !isAvatarBroken ? (
              <img
                src={normalizedAvatarUrl}
                alt={displayName}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-teal-100"
                onError={() => setIsAvatarBroken(true)}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#0D9488]">
                <User size={16} />
              </div>
            )}{" "}
            <p className="hidden text-sm font-medium text-[#0F172A] sm:block">
              {displayName}
            </p>
            <ChevronDown size={16} className="text-[#475569]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl shadow-slate-900/10">
              <Link
                to="/profile"
                onClick={() => setIsProfileMenuOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
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
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-60"
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
