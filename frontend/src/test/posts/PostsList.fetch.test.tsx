/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { PostsTelegram } from "@/routes/posts/-components/PostsTelegram";
import { ProfileMain } from "@/routes/profile/index";
import {
  fetchTelegramPostsHandler,
  fetchTelegramPostsHistory,
  fetchTelegramPostsOptionsHandler,
  resetFetchTelegramPostsHistory,
  tokenForecastsHandler,
} from "@/test/mocks/handlers";

const mockUsePostsMode = vi.fn();
vi.mock("@/routes/posts/-hooks/usePostsMode", () => ({
  usePostsMode: () => mockUsePostsMode(),
}));

const mockUseListAuthors = vi.fn();
vi.mock("@/routes/authors/-api/useListAuthors", () => ({
  useListAuthors: () => mockUseListAuthors(),
}));

const mockUseListTokens = vi.fn();
vi.mock("@/routes/tokens/-api/useListTokens", () => ({
  useListTokens: () => mockUseListTokens(),
}));

const mockUseScrollTop = vi.fn();
vi.mock("@/hooks/useScrollTop", () => ({
  useScrollTop: () => mockUseScrollTop(),
}));

const mockUseAuthState = vi.fn();
vi.mock("@/routes/auth/-hooks/useAuthState", () => ({
  useAuthState: (opts: unknown) => mockUseAuthState(opts),
}));

vi.mock("@/main", () => ({
  persister: { removeClient: vi.fn() },
  queryClient: {},
}));

vi.mock("@/api/useSessionQuery", () => ({
  useSessionQuery: () => ({
    data: { user: { email: "u@test.com" } },
    isPending: false,
    isFetching: false,
  }),
}));

vi.mock("@/routes/profile/-api/useUserProfile", async (importOriginal) => {
  const mod =
    await importOriginal<
      typeof import("@/routes/profile/-api/useUserProfile")
    >();
  return {
    ...mod,
    useUserProfile: () => ({
      data: { nickname: "User", profile_logo: null },
      isLoading: false,
      isError: false,
    }),
  };
});

const server = setupServer(
  fetchTelegramPostsOptionsHandler,
  fetchTelegramPostsHandler,
  tokenForecastsHandler,
);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return { Wrapper, queryClient };
}

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

function ProfileThenPostsApp({
  modeRef,
}: {
  modeRef: { current: "all" | "liked" | "disliked" | "favorites" };
}) {
  const [screen, setScreen] = React.useState<"profile" | "posts">("profile");

  React.useEffect(() => {
    const navigateHandler = (opts: {
      to: string;
      search?: { mode?: string };
    }) => {
      if (opts.to === "/posts" && opts.search?.mode) {
        const mode = opts.search.mode as "liked" | "disliked" | "favorites";
        modeRef.current = mode;
        setScreen("posts");
      }
    };
    mockNavigate.mockImplementation(navigateHandler);
    return () => {
      mockNavigate.mockReset();
    };
  }, [modeRef]);

  return screen === "profile" ? <ProfileMain /> : <PostsTelegram />;
}

describe("PostsTelegram fetch_telegram_posts (MSW)", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  beforeEach(() => {
    resetFetchTelegramPostsHistory();
    vi.clearAllMocks();

    mockUsePostsMode.mockReturnValue({ mode: "all" as const });
    mockUseListAuthors.mockReturnValue({ data: [] });
    mockUseListTokens.mockReturnValue({ data: [] });
    mockUseScrollTop.mockReturnValue({ show: false, scrollToTop: vi.fn() });
    mockUseAuthState.mockReturnValue({
      isAuthenticatedWith2FA: true,
      user: { id: "user-1", email: "u@test.com" },
    });
  });

  it("loads first page, renders posts; then loads next page with cursor from real response and renders extra posts", async () => {
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <PostsTelegram />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBe(1);
    });

    const first = fetchTelegramPostsHistory[0];
    expect(first.payload).toMatchObject({
      cursor_id: null,
      cursor_created_at: null,
      page_limit: 10,
      author_id: null,
      token_name: null,
      mode: "all",
    });

    await waitFor(() => {
      const authorLinks = screen.getAllByRole("link", { name: /author/i });
      expect(authorLinks).toHaveLength(10);
    });

    const loadMoreBtn = await screen.findByRole("button", {
      name: /load more/i,
    });

    const user = userEvent.setup();
    await user.click(loadMoreBtn);

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBe(2);
    });

    const expectedCursor = first.responseLastCursor;
    expect(expectedCursor).not.toBeNull();

    const second = fetchTelegramPostsHistory[1];
    expect(second.payload.cursor_id).toBe(expectedCursor!.id);
    expect(second.payload.cursor_created_at).toBe(expectedCursor!.created_at);

    expect(second.payload.page_limit).toBe(10);
    expect(second.payload.mode).toBe("all");

    await waitFor(() => {
      const secondPageLinks = screen.getAllByRole("link", {
        name: /second page author/i,
      });
      expect(secondPageLinks).toHaveLength(3);
    });

    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles).toHaveLength(13);
    });
  });

  it("when user selects author, fetch_telegram_posts is sent with author_id and posts render only from that author", async () => {
    const authorId = -1001792822445;
    const authorLabel = "COIN 22";
    mockUseListAuthors.mockReturnValue({
      data: [{ id: authorId, label: authorLabel }],
    });

    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <PostsTelegram />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBe(1);
    });

    const combobox = screen.getByRole("combobox", { name: /select author/i });
    const user = userEvent.setup();
    await user.click(combobox);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const option = screen.getByText(authorLabel);
    await user.click(option);

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBe(2);
    });

    const withAuthor = fetchTelegramPostsHistory[1];
    expect(withAuthor.payload.author_id).toBe(authorId);
    expect(withAuthor.payload.cursor_id).toBeNull();
    expect(withAuthor.payload.cursor_created_at).toBeNull();

    await waitFor(() => {
      const authorLinks = screen.getAllByRole("link", {
        name: new RegExp(authorLabel, "i"),
      });
      expect(authorLinks.length).toBeGreaterThan(0);
    });

    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(5);
  });

  it("when user selects token, fetch_telegram_posts is sent with token_name and TokenDetails renders", async () => {
    const token = {
      label: "Bitcoin",
      value: "BTC",
      cmc: "https://example.com/cmc",
      coinglass: "https://example.com/cg",
      homelink: "https://example.com",
      xlink: "https://example.com/x",
    };
    mockUseListTokens.mockReturnValue({ data: [token] });

    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <PostsTelegram />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBe(1);
    });

    const combobox = screen.getByRole("combobox", { name: /select token/i });
    const user = userEvent.setup();
    await user.click(combobox);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const option = screen.getByText(token.label);
    await user.click(option);

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBe(2);
    });

    const withToken = fetchTelegramPostsHistory[1];
    expect(withToken.payload.token_name).toBe(token.value);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /coinmarketcap/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /coinglass/i }),
    ).toBeInTheDocument();
  });

  it("when user clicks Liked Posts on profile, fetch_telegram_posts is sent with mode liked and all posts show Like active", async () => {
    const modeRef = { current: "all" as const };
    mockUsePostsMode.mockImplementation(() => ({ mode: modeRef.current }));
    mockUseAuthState.mockReturnValue({
      user: { id: "user-1", email: "u@test.com" },
    });

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProfileThenPostsApp modeRef={modeRef} />
      </Wrapper>,
    );

    expect(fetchTelegramPostsHistory.length).toBe(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /liked posts/i }));

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBeGreaterThanOrEqual(1);
    });
    const lastRequest =
      fetchTelegramPostsHistory[fetchTelegramPostsHistory.length - 1];
    expect(lastRequest.payload.mode).toBe("liked");

    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles.length).toBeGreaterThan(0);
    });
    const articles = screen.getAllByRole("article");
    const likePressed = screen.getAllByRole("button", {
      name: /like \(\d+\)/i,
      pressed: true,
    });
    expect(likePressed).toHaveLength(articles.length);
  });

  it("when user clicks Dislikes Posts on profile, fetch_telegram_posts is sent with mode disliked and all posts show Dislike active", async () => {
    const modeRef = { current: "all" as const };
    mockUsePostsMode.mockImplementation(() => ({ mode: modeRef.current }));
    mockUseAuthState.mockReturnValue({
      user: { id: "user-1", email: "u@test.com" },
    });

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProfileThenPostsApp modeRef={modeRef} />
      </Wrapper>,
    );

    expect(fetchTelegramPostsHistory.length).toBe(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /dislikes posts/i }));

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBeGreaterThanOrEqual(1);
    });
    const lastRequest =
      fetchTelegramPostsHistory[fetchTelegramPostsHistory.length - 1];
    expect(lastRequest.payload.mode).toBe("disliked");

    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles.length).toBeGreaterThan(0);
    });
    const articles = screen.getAllByRole("article");
    const dislikePressed = screen.getAllByRole("button", {
      name: /dislike \(\d+\)/i,
      pressed: true,
    });
    expect(dislikePressed).toHaveLength(articles.length);
  });

  it("when user clicks Favorites Posts on profile, fetch_telegram_posts is sent with mode favorites and all posts show Favorite active", async () => {
    const modeRef = { current: "all" as const };
    mockUsePostsMode.mockImplementation(() => ({ mode: modeRef.current }));
    mockUseAuthState.mockReturnValue({
      user: { id: "user-1", email: "u@test.com" },
    });

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProfileThenPostsApp modeRef={modeRef} />
      </Wrapper>,
    );

    expect(fetchTelegramPostsHistory.length).toBe(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /favorites posts/i }));

    await waitFor(() => {
      expect(fetchTelegramPostsHistory.length).toBeGreaterThanOrEqual(1);
    });
    const lastRequest =
      fetchTelegramPostsHistory[fetchTelegramPostsHistory.length - 1];
    expect(lastRequest.payload.mode).toBe("favorites");

    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles.length).toBeGreaterThan(0);
    });
    const articles = screen.getAllByRole("article");
    const favoritePressed = screen.getAllByRole("button", {
      name: "Remove from favorites",
    });
    expect(favoritePressed).toHaveLength(articles.length);
  });
});
