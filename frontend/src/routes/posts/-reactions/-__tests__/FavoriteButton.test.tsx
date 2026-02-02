import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as useAuthStateModule from "@/routes/auth/-hooks/useAuthState";
import * as useToggleFavoriteModule from "@/routes/posts/-reactions/-api/useToggleFavorite";
import FavoriteButton from "@/routes/posts/-reactions/-components/FavoriteButton";
import type { TelegramPost } from "@/types/db";

vi.mock("@/routes/auth/-hooks/useAuthState");
vi.mock("@/routes/posts/-reactions/-api/useToggleFavorite");

const mockPost: TelegramPost = {
  id: 42,
  text_caption: "",
  text_entities: null,
  media: null,
  tg_author_id: 1,
  author_name: "",
  author_link: "",
  like_count: 0,
  dislike_count: 0,
  comments_count: 0,
  reaction_type: null,
  user_reaction: null,
  is_favorite: false,
  created_at: null,
};

describe("FavoriteButton", () => {
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
    vi.mocked(useToggleFavoriteModule.useToggleFavorite).mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<
      typeof useToggleFavoriteModule.useToggleFavorite
    >);
  });

  it("renders button with Add to favorites when not favorite", () => {
    render(<FavoriteButton post={{ ...mockPost, is_favorite: false }} />);
    const btn = screen.getByRole("button", { name: "Add to favorites" });
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("renders button with Remove from favorites when favorite", () => {
    render(<FavoriteButton post={{ ...mockPost, is_favorite: true }} />);
    const btn = screen.getByRole("button", { name: "Remove from favorites" });
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("calls mutation with postId and userId when clicked", () => {
    render(<FavoriteButton post={mockPost} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to favorites" }));
    expect(mockMutate).toHaveBeenCalledWith({ postId: 42, userId: "u1" });
  });

  it("does not call mutation when user is not authenticated and button is clicked", () => {
    vi.mocked(useAuthStateModule.useAuthState).mockReturnValue({
      user: undefined,
      isAuthenticatedWith2FA: false,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    render(<FavoriteButton post={mockPost} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to favorites" }));
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
