/* eslint-disable @typescript-eslint/no-unsafe-return */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api";
import type { TelegramPost } from "@/types/db";

const mockRpc = vi.fn();

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const mockPost: TelegramPost = {
  id: 273,
  text_caption: "🔴 Локальная ситуация",
  text_entities: null,
  media: null,
  tg_author_id: -1001579090675,
  author_name: "⚡ КРИПТО илья",
  author_link: "+IAHAntovJzExNzE6",
  like_count: 1,
  dislike_count: 1,
  comments_count: 5,
  reaction_type: null,
  user_reaction: null,
  is_favorite: true,
  created_at: "2026-01-19T08:47:28.132924+00:00",
};

describe("api.posts.list (fetchTelegramPost)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls supabase.rpc with fetch_telegram_posts and correct payload", async () => {
    mockRpc.mockResolvedValueOnce({ data: [mockPost], error: null });

    await api.posts.list({
      cursorId: null,
      cursorCreatedAt: null,
      limit: 10,
      mode: "all",
      authorId: null,
      tokenName: null,
    });

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
      cursor_created_at: null,
      cursor_id: null,
      page_limit: 10,
      author_id: null,
      token_name: null,
      mode: "all",
    });
  });

  it("passes cursor, authorId, tokenName and mode to rpc", async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null });

    await api.posts.list({
      cursorId: 273,
      cursorCreatedAt: "2026-01-19T08:47:28.132924+00:00",
      limit: 10,
      mode: "favorites",
      authorId: -1001579090675,
      tokenName: "BTC",
    });

    expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
      cursor_created_at: "2026-01-19T08:47:28.132924+00:00",
      cursor_id: 273,
      page_limit: 10,
      author_id: -1001579090675,
      token_name: "BTC",
      mode: "favorites",
    });
  });

  it("returns parsed TelegramPost[] from response", async () => {
    const responseData = [mockPost];
    mockRpc.mockResolvedValueOnce({ data: responseData, error: null });

    const result = await api.posts.list({
      cursorId: null,
      cursorCreatedAt: null,
      limit: 10,
      mode: "all",
    });

    expect(result).toEqual(responseData);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 273,
      author_name: "⚡ КРИПТО илья",
      like_count: 1,
      dislike_count: 1,
      is_favorite: true,
      comments_count: 5,
    });
  });

  it("returns empty array when data is null", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null });

    const result = await api.posts.list({
      cursorId: null,
      cursorCreatedAt: null,
      limit: 10,
      mode: "all",
    });

    expect(result).toEqual([]);
  });

  it("throws when rpc returns error", async () => {
    const rpcError = new Error("RPC failed");
    mockRpc.mockResolvedValueOnce({ data: null, error: rpcError });

    await expect(
      api.posts.list({
        cursorId: null,
        cursorCreatedAt: null,
        limit: 10,
        mode: "all",
      }),
    ).rejects.toThrow("RPC failed");
  });
});
