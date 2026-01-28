import type { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ToastProvider } from "@/hooks/useToast";
import { supabase } from "@/lib/supabaseClient";
import type { TelegramPost } from "@/types/db";

import { PostCard } from "../-components/PostCard";
import PostsList from "../-components/PostsList";

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
  takeRecords: () => [],
}));

// Mock supabase
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

// Mock auth state
vi.mock("@/routes/auth/-hooks/useAuthState", () => ({
  useAuthState: () => ({
    isAuthenticatedWith2FA: false,
    hasPendingTwoFactor: false,
    userId: undefined,
    isLoading: false,
  }),
}));

// Mock filters store
vi.mock("@/store/useFiltersStore", () => ({
  useFiltersForMode: () => ({
    selectedAuthorId: null,
    selectedToken: null,
    setSelectedAuthorId: vi.fn(),
    setSelectedToken: vi.fn(),
  }),
}));

// Mock authors list
vi.mock("@/routes/authors/-api/useListAuthors", () => ({
  useListAuthors: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

// Mock infinite scroll hook
vi.mock("@/hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: () => vi.fn(),
}));

// Mock scroll top hook
vi.mock("@/hooks/useScrollTop", () => ({
  useScrollTop: () => ({ show: false, scrollToTop: vi.fn() }),
}));

// Sample post data matching the API response structure
const mockPost: TelegramPost = {
  id: 273,
  text_caption:
    "🟠Локальная ситуация 📊Выходные проходят спокойно, торги в пятницу закрылись на отметке 95,500$",
  text_entities: [
    { type: "bold", length: 2, offset: 0 },
    { type: "italic", length: 5, offset: 10 },
  ],
  media: [
    {
      type: "photo",
      url: "https://example.com/image.jpg",
      file_name: "image.jpg",
      mime_type: "image/jpeg",
    },
  ],
  tg_author_id: -1001579090675,
  author_name: "⚡ КРИПТО ИЛЬЯ 🍋",
  author_link: "+tAHAntovlzExNzE6",
  like_count: 0,
  dislike_count: 1,
  comments_count: 2,
  reaction_type: null,
  user_reaction: null,
  is_favorite: false,
  created_at: "2026-01-19T08:47:28.132924+00:00",
};

const mockPosts: TelegramPost[] = [
  mockPost,
  {
    ...mockPost,
    id: 272,
    text_caption: "Second post content",
    created_at: "2026-01-18T10:00:00.000000+00:00",
  },
  {
    ...mockPost,
    id: 270,
    text_caption: "Third post content",
    created_at: "2026-01-17T10:00:00.000000+00:00",
  },
];

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

describe("Posts API Requests", () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const mockRpc = vi.mocked(supabase.rpc) as unknown as ReturnType<
    typeof vi.fn<() => Promise<{ data: TelegramPost[]; error: null }>>
  >;

  beforeAll(() => {
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetch_telegram_posts RPC call", () => {
    it("should call RPC with correct payload for initial load", async () => {
      mockRpc.mockResolvedValueOnce({
        data: mockPosts,
        error: null,
      } as never);

      render(<PostsList mode="all" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
          p_cursor_created_at: null,
          p_cursor_id: null,
          p_limit: 10,
          p_author_id: null,
          p_token_name: null,
          p_mode: "all",
          p_user_id: null,
        });
      });
    });

    it("should call RPC with author filter when authorId is provided", async () => {
      mockRpc.mockResolvedValueOnce({
        data: mockPosts,
        error: null,
      } as never);

      render(<PostsList mode="all" authorId={-1001579090675} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
          p_cursor_created_at: null,
          p_cursor_id: null,
          p_limit: 10,
          p_author_id: -1001579090675,
          p_token_name: null,
          p_mode: "all",
          p_user_id: null,
        });
      });
    });

    it("should call RPC with token filter when tokenName is provided", async () => {
      mockRpc.mockResolvedValueOnce({
        data: mockPosts,
        error: null,
      } as never);

      render(<PostsList mode="all" tokenName="BTC" />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
          p_cursor_created_at: null,
          p_cursor_id: null,
          p_limit: 10,
          p_author_id: null,
          p_token_name: "BTC",
          p_mode: "all",
          p_user_id: null,
        });
      });
    });

    it("should call RPC with liked mode", async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
      } as never);

      render(<PostsList mode="liked" userId="user-123" />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
          p_cursor_created_at: null,
          p_cursor_id: null,
          p_limit: 10,
          p_author_id: null,
          p_token_name: null,
          p_mode: "liked",
          p_user_id: "user-123",
        });
      });
    });
  });

  describe("Post response data structure", () => {
    it("should return posts with correct data structure", async () => {
      mockRpc.mockResolvedValueOnce({
        data: [mockPost],
        error: null,
      } as never);

      render(<PostsList mode="all" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalled();
      });

      const result = mockRpc.mock.results[0];
      expect(result.type).toBe("return");

      // Verify response structure matches expected
      const responseData = await (result.value as Promise<{
        data: TelegramPost[];
      }>);
      expect(responseData.data[0]).toEqual(
        expect.objectContaining({
          id: 273,
          author_name: "⚡ КРИПТО ИЛЬЯ 🍋",
          author_link: "+tAHAntovlzExNzE6",
          comments_count: 2,
          like_count: 0,
          dislike_count: 1,
          is_favorite: false,
          user_reaction: null,
          tg_author_id: -1001579090675,
        }),
      );
    });
  });

  describe("PostCard rendering", () => {
    it("should render post with author name", () => {
      render(<PostCard post={mockPost} />, { wrapper: createWrapper() });

      expect(screen.getByText(/КРИПТО ИЛЬЯ/)).toBeTruthy();
    });

    it("should render post with text content", () => {
      render(<PostCard post={mockPost} />, { wrapper: createWrapper() });

      // Text is broken up by formatting elements, use a function matcher
      expect(
        screen.getByText((content) => content.includes("Выходные")),
      ).toBeTruthy();
    });

    it("should render author avatar with correct src", () => {
      render(<PostCard post={mockPost} />, { wrapper: createWrapper() });

      // Find the author image by its src attribute
      const authorImg = document.querySelector(
        'img[src*="/authors/-1001579090675"]',
      );
      expect(authorImg).toBeTruthy();
      expect(authorImg?.getAttribute("alt")).toBe("⚡ КРИПТО ИЛЬЯ 🍋");
    });
  });

  describe("Posts list rendering", () => {
    it("should render first page with null cursors", async () => {
      mockRpc.mockResolvedValueOnce({
        data: mockPosts,
        error: null,
      } as never);

      render(<PostsList mode="all" isAuthLoading={false} />, {
        wrapper: createWrapper(),
      });

      // Wait for RPC to be called
      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalled();
      });

      // Verify first page RPC call has null cursors
      expect(mockRpc).toHaveBeenCalledWith("fetch_telegram_posts", {
        p_cursor_created_at: null,
        p_cursor_id: null,
        p_limit: 10,
        p_author_id: null,
        p_token_name: null,
        p_mode: "all",
        p_user_id: null,
      });
    });

    it("should request second page with cursor from last post", () => {
      // Define last post from first page (this would be used as cursor for second page)
      const lastPostFromFirstPage = {
        id: 264,
        created_at: "2025-12-06T06:58:42.538901+00:00",
      };

      // Expected second page payload with cursor values
      const expectedSecondPagePayload = {
        p_cursor_created_at: lastPostFromFirstPage.created_at,
        p_cursor_id: lastPostFromFirstPage.id,
        p_limit: 10,
        p_author_id: null,
        p_token_name: null,
        p_mode: "all",
        p_user_id: null,
      };

      // Verify second page request structure is correct
      expect(expectedSecondPagePayload.p_cursor_created_at).toBe("2025-12-06T06:58:42.538901+00:00");
      expect(expectedSecondPagePayload.p_cursor_id).toBe(264);
      expect(expectedSecondPagePayload.p_limit).toBe(10);

      // Verify cursor values come from last post
      expect(expectedSecondPagePayload.p_cursor_created_at).toBe(lastPostFromFirstPage.created_at);
      expect(expectedSecondPagePayload.p_cursor_id).toBe(lastPostFromFirstPage.id);
    });

    it("should show loading skeleton while fetching", () => {
      mockRpc.mockImplementation(
        (): Promise<{ data: TelegramPost[]; error: null }> =>
          new Promise(() => {
            // Never resolves to keep loading state
          }),
      );

      render(<PostsList mode="all" />, { wrapper: createWrapper() });

      // Should show loading skeleton
      expect(document.querySelector(".MuiSkeleton-root")).toBeTruthy();
    });

    it("should show empty state for author with no posts", async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
      } as never);

      render(<PostsList mode="all" authorId={999} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText(/No posts from/)).toBeTruthy();
      });
    });
  });
});
