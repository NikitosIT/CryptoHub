import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as useListAuthorsModule from "@/routes/authors/-api/useListAuthors";
import * as useListTelegramPostsModule from "@/routes/posts/-api/useListTelegramPosts";
import PostsList from "@/routes/posts/-components/PostsList";
import * as useFiltersForModeModule from "@/store/useFiltersStore";
import type { TelegramPost } from "@/types/db";

vi.mock("@/routes/posts/-api/useListTelegramPosts");
vi.mock("@/routes/authors/-api/useListAuthors");
vi.mock("@/store/useFiltersStore", async (importOriginal) => {
  const actual = await importOriginal<typeof useFiltersForModeModule>();
  return { ...actual, useFiltersForMode: vi.fn() };
});
vi.mock("@/hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: () => ({ observerRef: null }),
}));
vi.mock("@/hooks/useScrollTop", () => ({
  useScrollTop: () => ({ show: false, scrollToTop: vi.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockPost: TelegramPost = {
  id: 273,
  text_caption: "Test caption",
  text_entities: null,
  media: null,
  tg_author_id: -1001579090675,
  author_name: "⚡ КРИПТО илья",
  author_link: "",
  like_count: 1,
  dislike_count: 1,
  comments_count: 5,
  reaction_type: null,
  user_reaction: null,
  is_favorite: true,
  created_at: "2026-01-19T08:47:28+00:00",
};

describe("PostsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useListTelegramPostsModule.useTelegramPosts).mockReturnValue({
      data: { pages: [[mockPost]], pageParams: [null] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    } as unknown as ReturnType<
      typeof useListTelegramPostsModule.useTelegramPosts
    >);
    vi.mocked(useListAuthorsModule.useListAuthors).mockReturnValue({
      data: [{ id: -1001579090675, label: "⚡ КРИПТО илья" }],
    } as ReturnType<typeof useListAuthorsModule.useListAuthors>);
    vi.mocked(useFiltersForModeModule.useFiltersForMode).mockReturnValue({
      selectedAuthorId: null,
      selectedToken: null,
      setSelectedAuthorId: vi.fn(),
      setSelectedToken: vi.fn(),
    });
  });

  it("renders posts from useTelegramPosts", () => {
    render(<PostsList />, { wrapper });
    expect(screen.getByText("Test caption")).toBeTruthy();
    expect(screen.getByText("⚡ КРИПТО илья")).toBeTruthy();
  });

  it("shows No posts from {author} when authorId is set and posts empty", () => {
    vi.mocked(useListTelegramPostsModule.useTelegramPosts).mockReturnValue({
      data: { pages: [[]], pageParams: [null] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    } as unknown as ReturnType<
      typeof useListTelegramPostsModule.useTelegramPosts
    >);
    vi.mocked(useFiltersForModeModule.useFiltersForMode).mockReturnValue({
      selectedAuthorId: -1001579090675,
      selectedToken: null,
      setSelectedAuthorId: vi.fn(),
      setSelectedToken: vi.fn(),
    });

    render(<PostsList />, { wrapper });

    expect(screen.getByText(/No posts from/)).toBeTruthy();
    expect(screen.getByText(/⚡ КРИПТО илья/)).toBeTruthy();
  });

  it("shows loading state when isLoading (no post content)", () => {
    vi.mocked(useListTelegramPostsModule.useTelegramPosts).mockReturnValue({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
    } as unknown as ReturnType<
      typeof useListTelegramPostsModule.useTelegramPosts
    >);

    render(<PostsList />, { wrapper });

    expect(screen.queryByText("Test caption")).toBeNull();
  });
});
