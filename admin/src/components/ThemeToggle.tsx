import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { selectThemeMode } from "@/store/themeSelector";
import { toggleTheme } from "@/store/themeSlice";

function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 text-gray-700 transition-colors rounded-lg dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-900"
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;
