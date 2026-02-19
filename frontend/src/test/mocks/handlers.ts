import { http, HttpResponse } from 'msw';

import type { TelegramPost } from '@/types/db';

const BASE = 'http://localhost';

export type FetchTelegramPostsPayload = {
  cursor_created_at: string | null;
  cursor_id: number | null;
  page_limit: number;
  author_id: number | null;
  token_name: string | null;
  mode: string;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization',
} as const;

function createMockPost(overrides: Partial<TelegramPost> = {}): TelegramPost {
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
    comments_count: null,
    reaction_type: null,
    user_reaction: null,
    is_favorite: false,
    created_at: '2025-01-01T12:00:00Z',
    ...overrides,
  };
}

function makeFirstPage(): TelegramPost[] {
  return Array.from({ length: 10 }, (_, i) =>
    createMockPost({
      id: i + 1,
      author_name: 'Author',
      created_at: `2025-01-01T12:00:0${i}Z`,
    }),
  );
}

function makeSecondPage(): TelegramPost[] {
  return Array.from({ length: 3 }, (_, i) =>
    createMockPost({
      id: 11 + i,
      author_name: 'Second Page Author',
      created_at: `2025-01-01T12:00:1${i}Z`,
    }),
  );
}

export type FetchTelegramPostsHistoryItem = {
  payload: FetchTelegramPostsPayload;
  response: TelegramPost[];
  responseLastCursor: { id: number; created_at: string } | null;
};

export const fetchTelegramPostsHistory: FetchTelegramPostsHistoryItem[] = [];

export function resetFetchTelegramPostsHistory() {
  fetchTelegramPostsHistory.length = 0;
}

export const fetchTelegramPostsOptionsHandler = http.options(
  `${BASE}/rest/v1/rpc/fetch_telegram_posts`,
  () =>
    new HttpResponse(null, {
      status: 204,
      headers: CORS_HEADERS,
    }),
);

const AUTHOR_LABEL_BY_ID: Record<number, string> = {
  [-1001792822445]: 'COIN 22',
};

function makeFilteredByToken(): TelegramPost[] {
  return Array.from({ length: 3 }, (_, i) =>
    createMockPost({
      id: 20 + i,
      author_name: 'Token Filter Author',
      created_at: `2025-01-01T13:00:0${i}Z`,
    }),
  );
}

function makeModeLikedPosts(): TelegramPost[] {
  return Array.from({ length: 3 }, (_, i) =>
    createMockPost({
      id: 40 + i,
      author_name: 'Liked Author',
      created_at: `2025-01-01T15:00:0${i}Z`,
      user_reaction: 'like',
      like_count: 1,
    }),
  );
}

function makeModeDislikedPosts(): TelegramPost[] {
  return Array.from({ length: 3 }, (_, i) =>
    createMockPost({
      id: 50 + i,
      author_name: 'Disliked Author',
      created_at: `2025-01-01T16:00:0${i}Z`,
      user_reaction: 'dislike',
      dislike_count: 1,
    }),
  );
}

function makeModeFavoritesPosts(): TelegramPost[] {
  return Array.from({ length: 3 }, (_, i) =>
    createMockPost({
      id: 60 + i,
      author_name: 'Favorites Author',
      created_at: `2025-01-01T17:00:0${i}Z`,
      is_favorite: true,
    }),
  );
}

export const tokenForecastsHandler = http.get(`${BASE}/rest/v1/token_forecasts`, () =>
  HttpResponse.json(
    [
      {
        token_name: 'Bitcoin',
        status: 'approved',
        created_at: '2025-01-01T00:00:00Z',
      },
    ],
    { headers: { ...CORS_HEADERS, 'Content-Range': '0-0/1' } },
  ),
);

export const fetchTelegramPostsHandler = http.post(
  `${BASE}/rest/v1/rpc/fetch_telegram_posts`,
  async ({ request }) => {
    const payload = (await request.json()) as FetchTelegramPostsPayload;

    const hasCursor = payload.cursor_id != null && payload.cursor_created_at != null;
    const hasAuthor = payload.author_id != null;
    const hasToken = payload.token_name != null;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const mode = payload.mode ?? 'all';

    let response: TelegramPost[];
    if (hasAuthor && payload.author_id != null) {
      const authorName = AUTHOR_LABEL_BY_ID[payload.author_id] ?? 'Filtered Author';
      response = Array.from({ length: 5 }, (_, i) =>
        createMockPost({
          id: 30 + i,
          author_name: authorName,
          created_at: `2025-01-01T14:00:0${i}Z`,
        }),
      );
    } else if (hasToken) {
      response = makeFilteredByToken();
    } else if (hasCursor) {
      response = makeSecondPage();
    } else if (mode === 'liked') {
      response = makeModeLikedPosts();
    } else if (mode === 'disliked') {
      response = makeModeDislikedPosts();
    } else if (mode === 'favorites') {
      response = makeModeFavoritesPosts();
    } else {
      response = makeFirstPage();
    }

    const last = response.at(-1) ?? null;
    const responseLastCursor =
      last && last.created_at ? { id: last.id, created_at: last.created_at } : null;

    fetchTelegramPostsHistory.push({ payload, response, responseLastCursor });

    return HttpResponse.json(response, { headers: CORS_HEADERS });
  },
);
