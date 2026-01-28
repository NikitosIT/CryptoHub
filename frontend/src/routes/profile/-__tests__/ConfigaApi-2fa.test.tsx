import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";

// Mock api
vi.mock("@/api", () => ({
  api: {
    twoFactor: {
      enable: vi.fn(),
      verifySetup: vi.fn(),
      disable: vi.fn(),
    },
  },
}));

describe("2FA Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("enable-2fa request", () => {
    it("should call enable-2fa and return qrUrl when user clicks enable button", async () => {
      const mockQrUrl = "otpauth://totp/CryptoHub:user@example.com?secret=ABC123&issuer=CryptoHub";

      vi.mocked(api.twoFactor.enable).mockResolvedValueOnce({
        qrUrl: mockQrUrl,
      });

      const response = await api.twoFactor.enable();

      expect(api.twoFactor.enable).toHaveBeenCalled();

      expect(response.qrUrl).toBe(mockQrUrl);
    });
  });

  describe("verify-2fa-setup request", () => {
    it("should call verify-2fa-setup with correct code when user confirms", async () => {
      const testCode = "123456";

      vi.mocked(api.twoFactor.verifySetup).mockResolvedValueOnce({
        success: true,
      });

      const response = await api.twoFactor.verifySetup(testCode);

      expect(api.twoFactor.verifySetup).toHaveBeenCalledWith(testCode);

      expect(response.success).toBe(true);
    });
  });

  describe("disable-2fa request", () => {
    it("should call disable-2fa with correct code when user wants to disable", async () => {
      const testCode = "654321";

      vi.mocked(api.twoFactor.disable).mockResolvedValueOnce({
        success: true,
      });

      const response = await api.twoFactor.disable(testCode);

      expect(api.twoFactor.disable).toHaveBeenCalledWith(testCode);

      expect(response.success).toBe(true);
    });
  });
});
