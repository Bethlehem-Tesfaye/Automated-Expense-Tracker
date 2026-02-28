import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "expense-tracker-theme";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark";

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : null;
};

const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const resolveTheme = (): ThemeMode =>
  getStoredTheme() ?? getSystemTheme();

export const applyTheme = (theme: ThemeMode) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("theme-dark", theme === "dark");
  root.setAttribute("data-theme", theme);
};

export const initializeTheme = () => {
  const theme = resolveTheme();
  applyTheme(theme);
  return theme;
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => resolveTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme: () =>
      setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
};
