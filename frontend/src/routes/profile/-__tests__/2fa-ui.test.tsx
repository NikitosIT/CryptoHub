import type { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Verify2FAPage } from "@/routes/auth/-components/Verify2FAPage";
import * as useVerify2FAModule from "@/routes/auth/-hooks/use2FAHook";

vi.mock("@/routes/auth/-hooks/use2FAHook");
vi.mock("@/components/ui/TwoFAForm", () => ({
  TwoFAForm: () => (
    <>
      <span>Confirm login</span>
      <p>Enter the 6-digit code from Google Authenticator (or another generator) to complete login.</p>
      <button type="submit">Confirm</button>
    </>
  ),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>;
}

describe("Verify2FAPage", () => {
  const mockHandle2FASubmit = vi.fn();
  const defaultMockControl = {} as ReturnType<
    typeof useVerify2FAModule.useVerify2FA
  >["control"];
  const defaultMockErrors = {} as ReturnType<
    typeof useVerify2FAModule.useVerify2FA
  >["twoFAFormErrors"];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useVerify2FAModule.useVerify2FA).mockReturnValue({
      control: defaultMockControl,
      twoFAFormErrors: defaultMockErrors,
      isAuthLoading: false,
      handle2FASubmit: mockHandle2FASubmit,
      is2FASubmitting: false,
      isCodeValid: true,
    });
  });

  it("shows Verifying authentication... when isAuthLoading is true", () => {
    vi.mocked(useVerify2FAModule.useVerify2FA).mockReturnValue({
      control: defaultMockControl,
      twoFAFormErrors: defaultMockErrors,
      isAuthLoading: true,
      handle2FASubmit: mockHandle2FASubmit,
      is2FASubmitting: false,
      isCodeValid: false,
    });

    render(<Verify2FAPage />, { wrapper });

    expect(
      screen.getByText("Verifying authentication..."),
    ).toBeTruthy();
  });

  it("shows TwoFAForm (Confirm login) when not loading", () => {
    render(<Verify2FAPage />, { wrapper });

    expect(screen.getByText("Confirm login")).toBeTruthy();
    expect(
      screen.getByText(
        "Enter the 6-digit code from Google Authenticator (or another generator) to complete login.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });
});
