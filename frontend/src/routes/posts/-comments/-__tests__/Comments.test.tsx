import type { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as useAuthStateModule from "@/routes/auth/-hooks/useAuthState";
import * as useCommentsListModule from "@/routes/posts/-comments/-api/useCommentList";
import { CommentModal } from "@/routes/posts/-comments/-components/CommentModal";
import * as useCommentsModalModule from "@/routes/posts/-comments/-hooks/useCommentsModal";
import type { CommentWithReplies } from "@/types/db";

vi.mock("@/routes/posts/-comments/-api/useCommentList");
vi.mock("@/routes/auth/-hooks/useAuthState");
vi.mock("@/routes/posts/-comments/-hooks/useCommentsModal");
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ showError: vi.fn() }),
}));
vi.mock("@/hooks/useEscapeKey", () => ({ useEscapeKey: () => {} }));

const mockComment: CommentWithReplies = {
  id: 418,
  user_id: "6c6d349b-663b-4746-9f09-b094d03ce9ac",
  post_id: 273,
  parent_comment_id: null,
  text: "hello",
  media: null,
  created_at: "2026-01-30T15:34:00+00:00",
  updated_at: "2026-01-30T15:34:00+00:00",
  user_has_liked: true,
  like_count: 1,
  user: {
    raw_user_meta_data: { nickname: "leoMessi", avatar_url: null },
  },
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

describe("CommentModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStateModule.useAuthState).mockReturnValue({
      user: { id: "u1" } as ReturnType<
        typeof useAuthStateModule.useAuthState
      >["user"],
      isAuthenticatedWith2FA: true,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    vi.mocked(useCommentsModalModule.useCommentsModal).mockReturnValue({
      replyingTo: null,
      editingComment: null,
      handleSubmit: vi.fn(),
      handleReplyClick: vi.fn(),
      handleEditClick: vi.fn(),
      cancelReply: vi.fn(),
      cancelEdit: vi.fn(),
      handleJumpToComment: vi.fn(),
      highlightedCommentId: null,
    } as ReturnType<typeof useCommentsModalModule.useCommentsModal>);
  });

  it("renders Comments title when open", () => {
    vi.mocked(useCommentsListModule.useCommentsList).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCommentsListModule.useCommentsList>);

    render(<CommentModal postId={273} isOpen={true} onClose={mockOnClose} />, {
      wrapper,
    });

    expect(screen.getByText("Comments")).toBeTruthy();
  });

  it("renders comment author and text when list has comments", () => {
    vi.mocked(useCommentsListModule.useCommentsList).mockReturnValue({
      data: [mockComment],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useCommentsListModule.useCommentsList>);

    render(<CommentModal postId={273} isOpen={true} onClose={mockOnClose} />, {
      wrapper,
    });

    expect(screen.getByText("leoMessi")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("renders No comments yet when list is empty", () => {
    vi.mocked(useCommentsListModule.useCommentsList).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useCommentsListModule.useCommentsList>);

    render(<CommentModal postId={273} isOpen={true} onClose={mockOnClose} />, {
      wrapper,
    });

    expect(screen.getByText("No comments yet. Be the first!")).toBeTruthy();
  });

  it("renders Loading comments when isLoading", () => {
    vi.mocked(useCommentsListModule.useCommentsList).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useCommentsListModule.useCommentsList>);

    render(<CommentModal postId={273} isOpen={true} onClose={mockOnClose} />, {
      wrapper,
    });

    expect(screen.getByText("Loading comments…")).toBeTruthy();
  });
});
