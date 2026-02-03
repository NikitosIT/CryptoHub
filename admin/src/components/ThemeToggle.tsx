import { Moon, Sun } from "lucide-react";

import { useThemeStore } from "@/store/useThemeStore";

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 text-black bg-white border rounded-lg dark:bg-zinc-900 dark:text-white"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;
