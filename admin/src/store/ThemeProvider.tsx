import { useEffect } from "react";
import { useSelector } from "react-redux";

import { selectThemeMode } from "@/store/themeSelector";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return <>{children}</>;
}

export default ThemeProvider;
