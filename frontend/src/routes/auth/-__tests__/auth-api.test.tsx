/* eslint-disable @typescript-eslint/no-unsafe-return */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";

const mockSignInWithOtp = vi.fn();
const mockVerifyOtp = vi.fn();

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
  },
}));

describe("api.auth.signInWithOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls supabase.auth.signInWithOtp with email and returns email on success", async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ data: {}, error: null });

    const result = await api.auth.signInWithOtp("user@example.com");

    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "user@example.com",
    });
    expect(result).toBe("user@example.com");
  });

  it("throws when supabase returns error", async () => {
    mockSignInWithOtp.mockResolvedValueOnce({
      data: {},
      error: { message: "Rate limit exceeded" },
    });

    await expect(api.auth.signInWithOtp("user@example.com")).rejects.toThrow(
      "Rate limit exceeded",
    );
  });
});

describe("api.auth.verifyOtp", () => {
  const mockSession = {
    access_token: "token",
    user: { id: "user-1" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls supabase.auth.verifyOtp with email, token, type and returns session", async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const result = await api.auth.verifyOtp("user@example.com", "123456");

    expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      token: "123456",
      type: "email",
    });
    expect(result).toEqual(mockSession);
  });

  it("throws when supabase returns error", async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: {},
      error: { message: "Invalid OTP" },
    });

    await expect(
      api.auth.verifyOtp("user@example.com", "000000"),
    ).rejects.toThrow("Invalid OTP");
  });

  it("throws when no session returned", async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    await expect(
      api.auth.verifyOtp("user@example.com", "123456"),
    ).rejects.toThrow("No session returned");
  });
});
