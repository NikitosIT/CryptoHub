/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CommentOpenButton } from '@/routes/posts/-entities/-comments/-components/CommentOpenButton';
import type { TelegramPost } from '@/routes/posts/-types/post-types';
import {
  commentsCreateRequests,
  commentsDeleteRequests,
  commentsLikeHandler,
  commentsLikeRequests,
  commentsListRequests,
  commentsUpdateRequests,
  createCommentHandler,
  deleteCommentHandler,
  listCommentsHandler,
  resetCommentsHandlersHistory,
  updateCommentHandler,
} from '@/test/mocks/commentsHandlers';

const mockUseAuthState = vi.fn();
vi.mock('@/routes/auth/-hooks/useAuthState', () => ({
  useAuthState: (opts: unknown) => mockUseAuthState(opts),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: {
              access_token: 'test-token',
              user: { id: 'user-1' },
            },
          },
        }),
    },
  },
}));

const server = setupServer(
  listCommentsHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
  commentsLikeHandler,
);

function createWrapper(initialProfile?: { nickname: string | null }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  if (initialProfile) {
    queryClient.setQueryData(['profile', 'user-1'], {
      nickname: initialProfile.nickname,
      profile_logo: null,
    });
  }
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

function createPost(overrides: Partial<TelegramPost> = {}): TelegramPost {
  return {
    id: 1,
    text_caption: null,
    text_entities: null,
    media: null,
    tg_author_id: null,
    author_name: 'Author',
    author_link: '',
    like_count: 0,
    dislike_count: 0,
    comments_count: 1,
    reaction_type: null,
    user_reaction: null,
    is_favorite: false,
    created_at: '2025-01-01T12:00:00Z',
    ...overrides,
  };
}

describe('Comments', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  beforeEach(() => {
    resetCommentsHandlersHistory();
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-1', email: 'u@test.com' },
    });
  });

  describe('CommentOpenButton', () => {
    it('when user clicks open comments, modal opens and list request is sent with payload and response', async () => {
      const post = createPost({ id: 42, comments_count: 2 });
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <CommentOpenButton post={post} />
        </Wrapper>,
      );

      expect(commentsListRequests).toHaveLength(0);

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /open comments/i }));

      await waitFor(() => {
        expect(commentsListRequests.length).toBeGreaterThanOrEqual(1);
      });
      const listReq = commentsListRequests[0];
      expect(listReq?.payload).toEqual({ post_id: 42 });

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /comments/i })).toBeInTheDocument();
      });
      expect(screen.getByText('Existing comment')).toBeInTheDocument();
    });
  });

  describe('CommentInput (create)', () => {
    it('when user types and clicks send, comment appears optimistically, create request is sent with payload and response, comment stays in document', async () => {
      const post = createPost({ id: 10, comments_count: 0 });
      const { Wrapper } = createWrapper({ nickname: 'TestUser' });

      render(
        <Wrapper>
          <CommentOpenButton post={post} />
        </Wrapper>,
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /open comments/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const textbox = screen.getByPlaceholderText('Write a comment...');
      await user.type(textbox, 'My new comment');

      expect(commentsCreateRequests).toHaveLength(0);
      await user.click(screen.getByRole('button', { name: 'Send comment' }));

      await waitFor(() => {
        expect(screen.getByText('My new comment')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(commentsCreateRequests.length).toBeGreaterThanOrEqual(1);
      });
      const createReq = commentsCreateRequests[0];
      expect(createReq?.payload).toMatchObject({
        post_id: 10,
        text: 'My new comment',
        parent_comment_id: null,
      });
      expect(createReq?.payload.media).toBeNull();

      expect(screen.getByText('My new comment')).toBeInTheDocument();
    });
  });

  describe('CommentActionsMenu (delete)', () => {
    it('when user clicks delete and confirms, delete request is sent and comment is removed from document', async () => {
      const post = createPost({ id: 20, comments_count: 1 });
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <CommentOpenButton post={post} />
        </Wrapper>,
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /open comments/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing comment')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Comment actions' }));

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /confirm delete/i }),
        ).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(commentsDeleteRequests.length).toBeGreaterThanOrEqual(1);
      });
      expect(commentsDeleteRequests[0]?.payload.comment_id).toBe(100);

      await waitFor(() => {
        expect(screen.queryByText('Existing comment')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit comment', () => {
    it('when user clicks edit, changes text and submits, update request is sent and comment text updates in document', async () => {
      const post = createPost({ id: 30, comments_count: 1 });
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <CommentOpenButton post={post} />
        </Wrapper>,
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /open comments/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing comment')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Comment actions' }));
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      await waitFor(() => {
        const textbox = screen.getByRole('textbox');
        expect(textbox).toHaveValue('Existing comment');
      });
      const textbox = screen.getByRole('textbox');
      await user.clear(textbox);
      await user.type(textbox, 'Edited comment text');
      await user.click(screen.getByRole('button', { name: 'Send comment' }));

      await waitFor(() => {
        expect(commentsUpdateRequests.length).toBeGreaterThanOrEqual(1);
      });
      expect(commentsUpdateRequests[0]?.payload).toMatchObject({
        comment_id: 100,
        text: 'Edited comment text',
      });

      await waitFor(() => {
        expect(screen.getByText('Edited comment text')).toBeInTheDocument();
      });
    });
  });

  describe('Toggle like', () => {
    it('when user clicks like, request is sent and UI shows liked state', async () => {
      const post = createPost({ id: 40, comments_count: 1 });
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <CommentOpenButton post={post} />
        </Wrapper>,
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /open comments/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing comment')).toBeInTheDocument();
      });

      const likeButton = screen.getByRole('button', { name: '2' });
      expect(likeButton).toBeInTheDocument();
      await user.click(likeButton);

      await waitFor(() => {
        expect(commentsLikeRequests.length).toBeGreaterThanOrEqual(1);
      });
      expect(commentsLikeRequests[0]?.payload.comment_id).toBe(100);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      });
    });
  });

  describe('Guest user', () => {
    it('when user is not logged in, can see comments but cannot send, delete, edit or like', async () => {
      mockUseAuthState.mockReturnValue({ user: null });
      const post = createPost({ id: 50, comments_count: 1 });
      const { Wrapper } = createWrapper();

      render(
        <Wrapper>
          <CommentOpenButton post={post} />
        </Wrapper>,
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /open comments/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Existing comment')).toBeInTheDocument();
      expect(screen.getByText('Please log in to comment')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Send comment' }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Comment actions' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Comment actions' }));
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeInTheDocument();
      });
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();

      const commentEl = document.getElementById('comment-100');
      expect(commentEl).toBeInTheDocument();
      const likeButton = commentEl!.querySelector('button');
      expect(likeButton).toBeDisabled();
    });
  });
});
