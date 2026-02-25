import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import ThemeToggle from "./ThemeToggle";
import { useAdminAuth } from "@/routes/auth/-api/useAdminAuth";

export default function Header() {
  const { authorized, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate({ to: "/auth" });
  };

  return (
    <>
      <header className="px-4 py-4 bg-black border-b border-orange-500/20 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-white transition-colors hover:text-orange-500 sm:text-3xl"
            >
              <img
                src="/free-icon-admin-with-cogwheels-78948.png"
                alt="Admin"
                className="w-8 h-8 sm:w-9 sm:h-9"
              />
              Admin Panel
            </Link>
            {authorized && (
              <nav className="hidden gap-4 sm:flex">
                <Link
                  to="/forecasts"
                  className={linkStyles}
                  activeProps={{
                    className: "text-orange-500 bg-gray-900",
                  }}
                >
                  Forecasts
                </Link>
                <Link
                  to="/notifications"
                  className={linkStyles}
                  activeProps={{
                    className: "text-orange-500 bg-gray-900",
                  }}
                >
                  Notifications
                </Link>
                <Link
                  to="/tokens/"
                  className={linkStyles}
                  activeProps={{
                    className: "text-orange-500 bg-gray-900",
                  }}
                >
                  Tokens
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {authorized && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 text-sm font-medium text-gray-300 transition-colors rounded-lg hover:text-red-400 hover:bg-gray-900"
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-sm p-6 mx-4 bg-gray-900 border border-gray-700 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-xl font-bold text-white">Выход</h2>
            <p className="mb-6 text-gray-400">
              Вы уверены, что хотите выйти из аккаунта?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-500"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const linkStyles =
  "px-3 py-2 text-sm font-medium text-gray-300 transition-colors rounded-lg hover:text-orange-500 hover:bg-gray-900";
