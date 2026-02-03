import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as useAuthStateModule from "@/routes/auth/-hooks/useAuthState";
import * as useToggleReactionModule from "@/routes/posts/-reactions/-api/useToggleReaction";
import { ReactionButton } from "@/routes/posts/-reactions/-components/ReactionButton";
import type { TelegramPost } from "@/types/db";

vi.mock("@/routes/auth/-hooks/useAuthState");
vi.mock("@/routes/posts/-reactions/-api/useToggleReaction");

const mockPost: TelegramPost = {
  id: 42,
  text_caption: "",
  text_entities: null,
  media: null,
  tg_author_id: 1,
  author_name: "",
  author_link: "",
  like_count: 10,
  dislike_count: 3,
  comments_count: 0,
  reaction_type: null,
  user_reaction: null,
  is_favorite: false,
  created_at: null,
};

describe("ReactionButton", () => {
  const mockMutate = vi.fn();

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
    vi.mocked(useToggleReactionModule.useToggleReaction).mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<
      typeof useToggleReactionModule.useToggleReaction
    >);
  });

  it("renders Like and Dislike with post counts", () => {
    render(<ReactionButton post={mockPost} />);
    expect(screen.getByRole("button", { name: "Like (10)" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dislike (3)" })).toBeTruthy();
  });

  it("calls mutation with postId and reactionType when Like is clicked", () => {
    render(<ReactionButton post={mockPost} />);
    fireEvent.click(screen.getByRole("button", { name: "Like (10)" }));
    expect(mockMutate).toHaveBeenCalledWith({
      postId: 42,
      reactionType: "like",
    });
  });
});
