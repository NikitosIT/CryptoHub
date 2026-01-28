import type { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";

import ProfileLogo from "../-components/ProfileLogo";

vi.mock("@/api", () => ({
  api: {
    profile: {
      uploadLogo: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/routes/auth/-hooks/useAuthState", () => ({
  useAuthState: () => ({
    userId: "test-user-123",
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock("@/components/ui/UserAvatar", () => ({
  UserAvatar: () => <div data-testid="user-avatar" />,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const theme = createTheme({ palette: { mode: "dark" } });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  };
}

describe("ProfileLogo – upload flow", () => {
  const uploadLogo = vi.mocked(api.profile.uploadLogo);
  const updateProfile = vi.mocked(api.profile.update);

  //очистка моков перед каждым тестом, во избежании багов
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads logo and updates profile with returned encryption", async () => {
    //При СЛЕДУЮЩЕМ вызове верни Promise, который зарезолвится в value//
    uploadLogo.mockResolvedValueOnce(undefined);
    updateProfile.mockResolvedValueOnce({});

    render(<ProfileLogo />, { wrapper: createWrapper() });

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(["avatar"], "avatar.jpg", {
      type: "image/jpeg",
    });

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      //waitFor нужен для асинхронных изменений пока результат не станет ожидаемым
      expect(uploadLogo).toHaveBeenCalledTimes(1);
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });

    const encryption = uploadLogo.mock.calls[0][2];

    expect(uploadLogo).toHaveBeenCalledWith(
      "test-user-123",
      file,
      expect.any(String),
    );

    expect(updateProfile).toHaveBeenCalledWith({
      user_id: "test-user-123",
      profile_logo: encryption,
    });
  });

  it("renders avatar after successful update", async () => {
    uploadLogo.mockResolvedValueOnce(undefined);
    updateProfile.mockResolvedValueOnce({
      profile_logo: "uuid",
    });

    render(<ProfileLogo />, { wrapper: createWrapper() });

    expect(screen.getByTestId("user-avatar")).toBeTruthy();

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });

    expect(screen.getByTestId("user-avatar")).toBeTruthy();
  });
});
