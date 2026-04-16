/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { InfiniteData } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FavoriteButton from '@/routes/posts/-entities/-reactions/-components/FavoriteButton';
import type { TelegramPost } from '@/routes/posts/-types/post-types';

import { createPost, createQueryClientWithPost } from './testUtils';

const mockToggleFavorite = vi.fn();

vi.mock('@/api', () => ({
  api: {
    reactions: {
      toggleFavorite: (...args: unknown[]) => mockToggleFavorite(...args),
    },
  },
}));

const mockUseAuthState = vi.fn();
vi.mock('@/routes/auth/-hooks/useAuthState', () => ({
  useAuthState: (options: unknown) => mockUseAuthState(options),
}));

function FavoriteButtonFromCache({
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
      <FavoriteButtonWithPostsQuery initialData={initialData} />
    </QueryClientProvider>
  );
}

function FavoriteButtonWithPostsQuery({
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
  return <FavoriteButton post={postFromCache} />;
}

describe('FavoriteButton', () => {
  const addedResponse = {
    success: true,
    status: 'added',
    is_favorite: true,
  } as const;

  const removedResponse = {
    success: true,
    status: 'removed',
    is_favorite: false,
  } as const;

  beforeEach(() => {
    mockToggleFavorite.mockReset();
  });

  it('when user clicks add-to-favorites, button becomes yellow and request is sent with correct payload and mock response', async () => {
    const post = createPost({ id: 42, is_favorite: false });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticatedWith2FA: true,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    mockToggleFavorite.mockResolvedValue(addedResponse);

    render(<FavoriteButtonFromCache post={post} queryClient={queryClient} />);

    const button = screen.getByRole('button', { name: /add to favorites/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveClass('bg-yellow-400');

    const user = userEvent.setup();
    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveClass('bg-yellow-400');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
      expect(mockToggleFavorite).toHaveBeenCalledWith(42);
    });
    expect(await mockToggleFavorite.mock.results[0]?.value).toEqual(addedResponse);
  });

  it('when already favorite, click removes reaction: button loses yellow and request is sent with correct payload and mock response', async () => {
    const post = createPost({ id: 99, is_favorite: true });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-2' },
      isAuthenticatedWith2FA: true,
      hasPendingTwoFactor: false,
      isLoading: false,
    });
    mockToggleFavorite.mockResolvedValue(removedResponse);

    render(<FavoriteButtonFromCache post={post} queryClient={queryClient} />);

    const button = screen.getByRole('button', {
      name: /remove from favorites/i,
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveClass('bg-yellow-400');

    const user = userEvent.setup();
    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
      expect(mockToggleFavorite).toHaveBeenCalledWith(99);
    });
    expect(await mockToggleFavorite.mock.results[0]?.value).toEqual(removedResponse);
  });

  it('when not logged in, click does nothing: no API call and button state unchanged', async () => {
    const post = createPost({ id: 10, is_favorite: false });
    const queryClient = createQueryClientWithPost(post);
    mockUseAuthState.mockReturnValue({
      user: undefined,
      isAuthenticatedWith2FA: false,
      hasPendingTwoFactor: false,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <FavoriteButton post={post} />
      </QueryClientProvider>,
    );

    const button = screen.getByRole('button', { name: /add to favorites/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveClass('bg-yellow-400');

    const user = userEvent.setup();
    await user.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveClass('bg-yellow-400');
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });
});
