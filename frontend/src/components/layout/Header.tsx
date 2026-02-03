import type { MouseEvent } from "react";
import HelpIcon from "@mui/icons-material/Help";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { useDisplayNickname } from "@/hooks/useDisplayNickname";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";

import { useHeaderNavigation } from "../../hooks/useHeaderNavigation";

export default function Header() {
  const { isAuthenticatedWith2FA, hasPendingTwoFactor, isLoading } =
    useAuthState({
      checkTwoFactor: true,
    });

  const { displayNickname } = useDisplayNickname();
  const { handleLoginClick, isOnVerificationPage } = useHeaderNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePath = location.pathname.startsWith("/profile");
  const isAuthPath = location.pathname.startsWith("/auth");

  const shouldShowLogin =
    !isLoading &&
    !isProfilePath &&
    (!isAuthenticatedWith2FA || hasPendingTwoFactor);

  const shouldShowProfile =
    !isLoading &&
    !isOnVerificationPage &&
    isAuthenticatedWith2FA &&
    displayNickname &&
    !hasPendingTwoFactor;

  const shouldShowHelp = isProfilePath || isAuthPath;

  const loginClassName =
    "text-sm text-white transition-colors bg-transparent border-none cursor-pointer sm:text-base font-montserratt hover:text-blue-400";

  const onLoginClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isOnVerificationPage && hasPendingTwoFactor) {
      void handleLoginClick(e);
      return;
    }

    void navigate({ to: "/auth/", replace: true });
  };

  const onHelpClick = () => void navigate({ to: "/help" });

  return (
    <header className="relative px-4 mt-2 mb-4 sm:mt-3 sm:mb-6">
      {shouldShowHelp ? <Helper onHelpClick={onHelpClick} /> : null}
      {/* Logo */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <Link
          to="/"
          className="font-bold leading-tight text-center transition-colors group font-montserratt"
          aria-label="Go to home page"
        >
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="text-white transition-colors group-hover:text-orange-400">
              Crypto
            </span>
            <span className="text-orange-400 transition-colors group-hover:text-white">
              Hub
            </span>
          </h1>
        </Link>
      </div>
      <nav className="absolute top-0 flex items-center h-full right-2 sm:top-0 sm:right-4">
        <ul className="flex items-center gap-2 sm:gap-4">
          {shouldShowLogin ? (
            <li>
              <button onClick={onLoginClick} className={loginClassName}>
                Login
              </button>
            </li>
          ) : null}

          {shouldShowProfile ? (
            <li>
              <Link
                className="flex items-center gap-1.5 sm:gap-2 text-white transition-colors hover:text-blue-400"
                to="/profile/"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8">
                  <UserAvatar size={28} showSkeleton={false} />
                </div>
                <span className="hidden text-sm sm:inline font-montserratt sm:text-base">
                  {displayNickname}
                </span>
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}

function Helper({ onHelpClick }: { onHelpClick: () => void }) {
  return (
    <Box
      component="aside"
      aria-label="Help actions"
      sx={{
        position: "absolute",
        top: 0,
        left: { xs: 8, sm: 16 },
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Tooltip title="Help" arrow>
        <IconButton
          aria-label="Open help"
          onClick={onHelpClick}
          sx={{
            color: "#fff",
            transition: "0.25s",
            "&:hover": {
              color: "#fb923c",
              bgcolor: "rgba(251,146,60,0.08)",
              transform: "scale(1.1)",
            },
          }}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
