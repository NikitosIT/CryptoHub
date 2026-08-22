/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { InfiniteData } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReactionButton } from '@/routes/posts/-entities/-reactions/-components/ReactionButton';
import type { TelegramPost } from '@/routes/posts/-types/post-types';

import { createPost, createQueryClientWithPost } from './testUtils';

const mockToggle = vi.fn();

vi.mock('@/api', () => ({
  api: {
    reactions: {
      toggle: (...args: unknown[]) => mockToggle(...args),
    },
  },
}));

const mockUseAuthState = vi.fn();
vi.mock('@/routes/auth/-hooks/useAuthState', () => ({
  useAuthState: (options: unknown) => mockUseAuthState(options),
}));

function ReactionButtonFromCache({
  post,
  queryClient,
}: {
  post: TelegramPost;
  queryClient: QueryClient;
}) {
  const initialData: InfiniteData<TelegramPost[]> = {
    pages: [[post]],
    pageParams: [undefined],
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ReactionButtonWithPostsQuery initialData={initialData} />
    </QueryClientProvider>
  );
}

function ReactionButtonWithPostsQuery({
  initialData,
}: {
  initialData: InfiniteData<TelegramPost[]>;
}) {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: async () =>
      Promise.resolve({
        pages: [] as TelegramPost[][],
        pageParams: [] as unknown[],
      }),
    initialData,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const postFromCache = data.pages[0]?.[0];
  if (!postFromCache) return null;
  return <ReactionButton post={postFromCache} />;
}

const successResponse = {
  success: true,
  post_id: 273,
  like_count: 1,
  dislike_count: 1,
} as const;

describe('ReactionButton', () => {
  beforeEach(() => {
    mockToggle.mockReset();
  });

  it('when user clicks like, button becomes green and request is sent with correct payload and mock response', async () => {
    const post = createPost({
      id: 273,
      like_count: 0,
      dislike_count: 0,
      user_reaction: null,
    });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticatedWith2FA: true,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    mockToggle.mockResolvedValue(successResponse);

    render(<ReactionButtonFromCache post={post} queryClient={queryClient} />);

    const likeButton = screen.getByRole('button', { name: 'Like (0)' });

    expect(likeButton).toHaveAttribute('aria-pressed', 'false');
    expect(likeButton).not.toHaveClass('bg-green-500');

    const user = userEvent.setup();
    await user.click(likeButton);

    await waitFor(() => {
      expect(likeButton).toHaveClass('bg-green-500');
      expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    });

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledTimes(1);
      expect(mockToggle).toHaveBeenCalledWith({
        postId: 273,
        reactionType: 'like',
      });
    });
    expect(await mockToggle.mock.results[0]?.value).toEqual(successResponse);
  });

  it('when user clicks dislike, button becomes red and request is sent with correct payload and mock response', async () => {
    const post = createPost({
      id: 273,
      like_count: 0,
      dislike_count: 0,
      user_reaction: null,
    });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticatedWith2FA: true,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    mockToggle.mockResolvedValue({
      ...successResponse,
      like_count: 0,
      dislike_count: 1,
    });

    render(<ReactionButtonFromCache post={post} queryClient={queryClient} />);

    const dislikeButton = screen.getByRole('button', {
      name: 'Dislike (0)',
    });

    expect(dislikeButton).toHaveAttribute('aria-pressed', 'false');
    expect(dislikeButton).not.toHaveClass('bg-red-500');

    const user = userEvent.setup();
    await user.click(dislikeButton);

    await waitFor(() => {
      expect(dislikeButton).toHaveClass('bg-red-500');
      expect(dislikeButton).toHaveAttribute('aria-pressed', 'true');
    });

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledTimes(1);
      expect(mockToggle).toHaveBeenCalledWith({
        postId: 273,
        reactionType: 'dislike',
      });
    });
  });

  it('when not logged in, user cannot make reactions: no API call and button state unchanged', async () => {
    const post = createPost({
      id: 273,
      like_count: 0,
      dislike_count: 0,
      user_reaction: null,
    });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: undefined,
      isAuthenticatedWith2FA: false,
      hasPendingTwoFactor: false,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReactionButton post={post} />
      </QueryClientProvider>,
    );

    const [likeButton, dislikeButton] = screen.getAllByRole('button');
    if (!likeButton || !dislikeButton) return null;
    expect(likeButton).toHaveAccessibleName('Like (0)');
    expect(dislikeButton).toHaveAccessibleName('Dislike (0)');

    const user = userEvent.setup();
    await user.click(likeButton);
    await user.click(dislikeButton);

    expect(likeButton).toHaveAttribute('aria-pressed', 'false');
    expect(dislikeButton).toHaveAttribute('aria-pressed', 'false');
    expect(likeButton).not.toHaveClass('bg-green-500');
    expect(dislikeButton).not.toHaveClass('bg-red-500');
    expect(mockToggle).not.toHaveBeenCalled();
  });

  it('when has like and user clicks dislike, button switches to red and request is sent', async () => {
    const post = createPost({
      id: 273,
      like_count: 1,
      dislike_count: 0,
      user_reaction: 'like',
    });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticatedWith2FA: true,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    mockToggle.mockResolvedValue({
      ...successResponse,
      like_count: 0,
      dislike_count: 1,
    });

    render(<ReactionButtonFromCache post={post} queryClient={queryClient} />);

    const likeButton = screen.getByRole('button', { name: 'Like (1)' });
    const dislikeButton = screen.getByRole('button', {
      name: 'Dislike (0)',
    });

    expect(likeButton).toHaveClass('bg-green-500');
    expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    expect(dislikeButton).not.toHaveClass('bg-red-500');
    expect(dislikeButton).toHaveAttribute('aria-pressed', 'false');

    const user = userEvent.setup();
    await user.click(dislikeButton);

    await waitFor(() => {
      expect(likeButton).not.toHaveClass('bg-green-500');
      expect(likeButton).toHaveAttribute('aria-pressed', 'false');
      expect(dislikeButton).toHaveClass('bg-red-500');
      expect(dislikeButton).toHaveAttribute('aria-pressed', 'true');
    });

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledTimes(1);
      expect(mockToggle).toHaveBeenCalledWith({
        postId: 273,
        reactionType: 'dislike',
      });
    });
  });
});
