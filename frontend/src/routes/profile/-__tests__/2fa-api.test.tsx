import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";

vi.mock("@/api/getSession", () => ({
  getSession: vi.fn().mockResolvedValue({
    access_token: "test-token",
    user: { id: "u1" },
  }),
  getRequestAuth: vi.fn().mockResolvedValue({ accessToken: "test-token" }),
}));

describe("api.twoFactor with fetch", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("api.twoFactor.enable", () => {
    it("calls fetch with enable-2fa URL, POST, headers and empty body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ qrUrl: "data:image/png;base64,abc" }),
      });

      await api.twoFactor.enable();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const [url, options] = call;
      expect(String(url)).toContain("/enable-2fa");
      expect(options.method).toBe("POST");
      expect(options.headers).toMatchObject({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      });
      expect(JSON.parse(options.body as string)).toEqual({});
    });

    it("returns parsed response with qrUrl", async () => {
      const responseData = { qrUrl: "data:image/png;base64,xyz123" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const result = await api.twoFactor.enable();

      expect(result).toEqual(responseData);
      expect(result.qrUrl).toBe("data:image/png;base64,xyz123");
    });
  });

  describe("api.twoFactor.verifySetup", () => {
    it("calls fetch with verify-2fa-setup URL, POST, headers and body { code }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await api.twoFactor.verifySetup("123456");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const [url, options] = call;
      expect(String(url)).toContain("/verify-2fa-setup");
      expect(options.method).toBe("POST");
      expect(options.headers).toMatchObject({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      });
      expect(JSON.parse(options.body as string)).toEqual({
        code: "123456",
      });
    });

    it("returns parsed response with success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.twoFactor.verifySetup("123456");

      expect(result).toEqual({ success: true });
    });
  });

  describe("api.twoFactor.verifyLogin", () => {
    it("calls fetch with verify-login-2fa URL, POST, headers and body { code }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            verified: true,
            is_verified_for_current_session: true,
          }),
      });

      await api.twoFactor.verifyLogin("654321");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const [url, options] = call;
      expect(String(url)).toContain("/verify-login-2fa");
      expect(options.method).toBe("POST");
      expect(options.headers).toMatchObject({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      });
      expect(JSON.parse(options.body as string)).toEqual({
        code: "654321",
      });
    });

    it("returns parsed response with verified and is_verified_for_current_session", async () => {
      const responseData = {
        verified: true,
        is_verified_for_current_session: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const result = await api.twoFactor.verifyLogin("654321");

      expect(result).toEqual(responseData);
      expect(result.verified).toBe(true);
      expect(result.is_verified_for_current_session).toBe(true);
    });

    it("throws on non-ok with body.error and remainingAttempts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Invalid code",
            remainingAttempts: 2,
          }),
      });

      await expect(api.twoFactor.verifyLogin("000000")).rejects.toThrow();
    });
  });

  describe("api.twoFactor.disable", () => {
    it("calls fetch with disable-2fa URL, POST, headers and body { code }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await api.twoFactor.disable("123456");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const [url, options] = call;
      expect(String(url)).toContain("/disable-2fa");
      expect(options.method).toBe("POST");
      expect(options.headers).toMatchObject({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      });
      expect(JSON.parse(options.body as string)).toEqual({
        code: "123456",
      });
    });

    it("returns parsed response with success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.twoFactor.disable("123456");

      expect(result).toEqual({ success: true });
    });
  });
});
