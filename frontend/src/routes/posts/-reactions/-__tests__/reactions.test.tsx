import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";

vi.mock("@/api/getSession", () => ({
  getSession: vi.fn().mockResolvedValue({
    access_token: "test-token",
    user: { id: "u1" },
  }),
  getRequestAuth: vi.fn().mockResolvedValue({ accessToken: "test-token" }),
}));

describe("api.reactions.toggle (toggleReactions) with fetch", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetch with POST, toggle-reactions URL, headers and body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await api.reactions.toggle({ postId: 1, reactionType: "like" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0] as [string, RequestInit];
    const [url, options] = call;
    expect(String(url)).toContain("/toggle-reactions");
    expect(String(url)).not.toContain("action=");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    expect(JSON.parse(options.body as string)).toEqual({
      post_id: 1,
      reaction_type: "like",
    });
  });

  it("returns parsed response with success, post_id, like_count, dislike_count", async () => {
    const responseData = {
      success: true,
      post_id: 273,
      like_count: 1,
      dislike_count: 1,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseData),
    });

    const result = await api.reactions.toggle({
      postId: 273,
      reactionType: "like",
    });

    expect(result).toEqual(responseData);
    expect(result).toMatchObject({
      success: true,
      post_id: 273,
      like_count: 1,
      dislike_count: 1,
    });
  });

  it("throws on non-ok response with body.error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Auth required" }),
    });

    await expect(
      api.reactions.toggle({ postId: 1, reactionType: "like" })
    ).rejects.toThrow("Auth required");
  });
});

describe("api.reactions.toggleFavorite (toggleFavorite) with fetch", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetch with POST, toggle-favorites URL, headers and body (post_id)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          status: "added",
          is_favorite: true,
        }),
    });

    await api.reactions.toggleFavorite(273);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0] as [string, RequestInit];
    const [url, options] = call;
    expect(String(url)).toContain("/toggle-favorites");
    expect(String(url)).not.toContain("action=");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    expect(JSON.parse(options.body as string)).toEqual({
      post_id: 273,
    });
  });

  it("returns parsed response with success, status, is_favorite", async () => {
    const responseData = {
      success: true,
      status: "added" as const,
      is_favorite: true,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseData),
    });

    const result = await api.reactions.toggleFavorite(1);

    expect(result).toEqual(responseData);
    expect(result).toMatchObject({
      success: true,
      status: "added",
      is_favorite: true,
    });
  });
});
