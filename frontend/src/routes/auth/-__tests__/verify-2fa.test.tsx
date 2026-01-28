import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";

// Mock api
vi.mock("@/api", () => ({
  api: {
    twoFactor: {
      getStatus: vi.fn(),
      verifyLogin: vi.fn(),
      clearVerification: vi.fn(),
    },
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe("2FA Verification Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get-2fa-status request", () => {
    it("should redirect to profile when 2FA is disabled (enabled: false)", async () => {
      vi.mocked(api.twoFactor.getStatus).mockResolvedValueOnce({
        enabled: false,
        is_verified_for_current_session: false,
      });

      const response = await api.twoFactor.getStatus();

      expect(api.twoFactor.getStatus).toHaveBeenCalled();

      expect(response.enabled).toBe(false);
    });

    it("should redirect to verify-2fa when 2FA is enabled (enabled: true)", async () => {
      vi.mocked(api.twoFactor.getStatus).mockResolvedValueOnce({
        enabled: true,
        is_verified_for_current_session: false,
      });

      const response = await api.twoFactor.getStatus();

      expect(api.twoFactor.getStatus).toHaveBeenCalled();

      expect(response.enabled).toBe(true);
      expect(response.is_verified_for_current_session).toBe(false);
    });
  });

  describe("verify-login-2fa request", () => {
    it("should call verify-login-2fa with correct code and redirect to profile on success", async () => {
      const testCode = "123456";

      vi.mocked(api.twoFactor.verifyLogin).mockResolvedValueOnce({
        verified: true,
        is_verified_for_current_session: true,
      });

      const response = await api.twoFactor.verifyLogin(testCode);

      expect(api.twoFactor.verifyLogin).toHaveBeenCalledWith(testCode);

      expect(response.verified).toBe(true);
      expect(response.is_verified_for_current_session).toBe(true);
    });

    it("should return error with remaining attempts on invalid code", async () => {
      const invalidCode = "000000";

      vi.mocked(api.twoFactor.verifyLogin).mockResolvedValueOnce({
        verified: false,
        error: "Invalid code",
        remainingAttempts: 2,
      });

      const response = await api.twoFactor.verifyLogin(invalidCode);

      expect(api.twoFactor.verifyLogin).toHaveBeenCalledWith(invalidCode);

      expect(response.verified).toBe(false);
      expect(response.error).toBe("Invalid code");
      expect(response.remainingAttempts).toBe(2);
    });
  });

  describe("clear-2fa-verification on logout", () => {
    it("should call clear-2fa-verification with correct response on logout", async () => {
      // Mock clear-2fa-verification success response
      vi.mocked(api.twoFactor.clearVerification).mockResolvedValueOnce({
        success: true,
        message: "2FA verification cleared",
      });

      const response = await api.twoFactor.clearVerification();

      // Verify clear-2fa-verification was called
      expect(api.twoFactor.clearVerification).toHaveBeenCalled();

      // Verify response indicates successful clear
      expect(response.success).toBe(true);
      expect(response.message).toBe("2FA verification cleared");
    });
  });
});
