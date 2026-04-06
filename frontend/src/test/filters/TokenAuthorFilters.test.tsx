/* eslint-disable @typescript-eslint/no-unsafe-return */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Author } from '@/routes/authors/-api/useListAuthors';
import { PostsTelegram } from '@/routes/posts/-components/PostsTelegram';
import type { CryptoTokens } from '@/routes/tokens/-api/useListCryptoTokens';

const mockAuthorsList = vi.fn();
const mockCryptoTokens = vi.fn();
const mockPostsList = vi.fn();

vi.mock('@/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/api')>();
  return {
    ...mod,
    api: {
      ...mod.api,
      authors: {
        ...mod.api.authors,
        list: () => mockAuthorsList(),
      },
      tokens: {
        ...mod.api.tokens,
        crypto: () => mockCryptoTokens(),
      },
      posts: {
        ...mod.api.posts,
        list: () => mockPostsList(),
      },
    },
  };
});

const mockUsePostsMode = vi.fn();
vi.mock('@/routes/posts/-hooks/usePostsMode', () => ({
  usePostsMode: () => mockUsePostsMode(),
}));

vi.mock('@/routes/auth/-hooks/useAuthState', () => ({
  useAuthState: () => ({ user: null }),
}));

const authorFromApi: Author = {
  label: 'Crypto Daily – биткоин, криптовалюта',
  id: -1001389304944,
};

const tokenFromApi: CryptoTokens = {
  id: 'stellar',
  symbol: 'XLM',
  name: 'Stellar',
  image:
    'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
  current_price: 0.12,
  market_cap: 3_500_000_000,
  market_cap_rank: 25,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('Filters on main page (mocked api)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostsMode.mockReturnValue({ mode: 'all' as const });
    mockAuthorsList.mockResolvedValue([authorFromApi]);
    mockCryptoTokens.mockResolvedValue([tokenFromApi]);
    mockPostsList.mockResolvedValue([]);
  });

  it('on load fetches authors and tokens, then renders FilterByAuthors and FilterByToken with response data', async () => {
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <PostsTelegram />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(mockAuthorsList).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockCryptoTokens).toHaveBeenCalled();
    });

    expect(mockAuthorsList).toHaveBeenCalledTimes(1);
    expect(mockCryptoTokens).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /select author/i }),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /select token/i })).toBeInTheDocument();
    });
  });

  it('author dropdown shows author from api response', async () => {
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <PostsTelegram />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /select author/i }),
      ).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: /select author/i }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    expect(screen.getByText(authorFromApi.label)).toBeInTheDocument();
  });

  it('token dropdown shows token from api response', async () => {
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <PostsTelegram />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /select token/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: /select token/i }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    expect(screen.getByText(tokenFromApi.name)).toBeInTheDocument();
  });
});
