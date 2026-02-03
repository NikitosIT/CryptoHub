import { Outlet, useLocation } from "@tanstack/react-router";
import Header from "./Header";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";

export function MainLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <div>
      {!isAuthPage && <Header />}
      {!isAuthPage && <hr className="mb-4 sm:mb-6 md:mb-8" />}
      <div className={!isAuthPage ? "px-2 sm:px-4 md:px-6 lg:px-8 " : ""}>
        <Outlet />
      </div>
    </div>
  );
}
