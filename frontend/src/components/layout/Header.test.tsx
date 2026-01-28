import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import Header from "./Header";
import * as useAuthStateModule from "@/routes/auth/-hooks/useAuthState";
import * as useDisplayNicknameModule from "@/hooks/useDisplayNickname";
import * as apiModule from "@/api";
import * as routerModule from "@tanstack/react-router";
import { ToastProvider } from "@/hooks/useToast";

vi.mock("@/routes/auth/-hooks/useAuthState");
vi.mock("@/hooks/useDisplayNickname");
vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof apiModule>("@/api");
  return {
    ...actual,
    api: {
      ...actual.api,
      twoFactor: {
        ...actual.api.twoFactor,
        clearVerification: vi.fn(),
      },
      auth: {
        ...actual.api.auth,
        signOut: vi.fn(),
      },
    },
  };
});
vi.mock("@/components/ui/UserAvatar", () => ({
  UserAvatar: ({ userId }: { userId: string | undefined }) => (
    <div data-testid="user-avatar" data-user-id={userId}>
      Avatar
    </div>
  ),
}));
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
    Link: ({ children, to }: { children: ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={createTheme()}>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe("Header", () => {
  const mockUseAuthState = vi.mocked(useAuthStateModule.useAuthState);
  const mockUseDisplayNickname = vi.mocked(
    useDisplayNicknameModule.useDisplayNickname
  );
  const mockNavigate = vi.fn();
  const mockClearVerification = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(routerModule.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(routerModule.useLocation).mockReturnValue({
      pathname: "/",
    } as any);

    mockClearVerification.mockResolvedValue({
      success: true,
      message: "2FA verification cleared",
    });

    mockSignOut.mockResolvedValue(undefined);

    vi.mocked(apiModule.api.twoFactor.clearVerification).mockImplementation(
      mockClearVerification
    );
    vi.mocked(apiModule.api.auth.signOut).mockImplementation(mockSignOut);
  });

  describe("Unauthenticated user", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue({
        isAuthenticatedWith2FA: false,
        hasPendingTwoFactor: false,
        userId: undefined,
        isLoading: false,
      });

      mockUseDisplayNickname.mockReturnValue({
        displayNickname: null,
        userId: undefined,
      });
    });

    it("should show Login button when user is not authenticated", () => {
      render(<Header />, { wrapper: createWrapper() });

      const loginButton = screen.getByText("Login");
      expect(loginButton).toBeTruthy();
    });

    it("should navigate to /auth/ when Login button is clicked", () => {
      render(<Header />, { wrapper: createWrapper() });

      const loginButton = screen.getByText("Login");
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/auth/",
        replace: true,
      });
    });
  });

  describe("Authenticated user", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue({
        isAuthenticatedWith2FA: true,
        hasPendingTwoFactor: false,
        userId: "user-123",
        isLoading: false,
      });

      mockUseDisplayNickname.mockReturnValue({
        displayNickname: "TestUser",
        userId: "user-123",
      });
    });

    it("should show nickname and avatar when user is authenticated", () => {
      render(<Header />, { wrapper: createWrapper() });

      const nickname = screen.getByText("TestUser");
      const avatar = screen.getByTestId("user-avatar");

      expect(nickname).toBeTruthy();
      expect(avatar).toBeTruthy();
      expect(avatar.getAttribute("data-user-id")).toBe("user-123");
    });

    it("should not show Login button when user is authenticated", () => {
      render(<Header />, { wrapper: createWrapper() });

      const loginButtons = screen.queryAllByText("Login");
      expect(loginButtons.length).toBe(0);
    });
  });

  describe("Verify-2FA page", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue({
        isAuthenticatedWith2FA: false,
        hasPendingTwoFactor: true,
        userId: "user-123",
        isLoading: false,
      });

      mockUseDisplayNickname.mockReturnValue({
        displayNickname: null,
        userId: "user-123",
      });

      vi.mocked(routerModule.useLocation).mockReturnValue({
        pathname: "/auth/verify-2fa",
      } as any);
    });

    it("should show Login button on verify-2fa page when hasPendingTwoFactor is true", () => {
      render(<Header />, { wrapper: createWrapper() });

      const loginButton = screen.getByText("Login");
      expect(loginButton).toBeTruthy();
    });

    it("should call api.twoFactor.clearVerification when Login button is clicked on verify-2fa page", async () => {
      render(<Header />, { wrapper: createWrapper() });

      const loginButton = screen.getByText("Login");
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockClearVerification).toHaveBeenCalled();
      });

      // Verify that clear-2fa-verification endpoint was called
      expect(mockClearVerification).toHaveBeenCalledTimes(1);
    });

    it("should navigate to /auth/ after clearing 2FA verification", async () => {
      render(<Header />, { wrapper: createWrapper() });

      const loginButton = screen.getByText("Login");
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockClearVerification).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/auth/",
          replace: true,
        });
      });
    });
  });

  describe("Edge cases", () => {
    it("should show Login when loading is false and not authenticated", () => {
      mockUseAuthState.mockReturnValue({
        isAuthenticatedWith2FA: false,
        hasPendingTwoFactor: false,
        userId: undefined,
        isLoading: false,
      });

      mockUseDisplayNickname.mockReturnValue({
        displayNickname: null,
        userId: undefined,
      });

      render(<Header />, { wrapper: createWrapper() });

      const loginButton = screen.getByText("Login");
      expect(loginButton).toBeTruthy();
    });
  });
});
