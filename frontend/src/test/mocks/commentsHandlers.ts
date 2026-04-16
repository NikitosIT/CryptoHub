import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization',
} as const;

export type MockComment = {
  id: number;
  user_id: string | null;
  post_id: number;
  parent_comment_id: number | null;
  text: string;
  media: unknown;
  created_at: string;
  updated_at: string;
  like_count: number;
  user_has_liked?: boolean;
  user?: {
    raw_user_meta_data?: {
      nickname?: string | null;
      avatar_url?: string | null;
    };
  };
};

export type CommentsListPayload = { post_id: number };
export type CommentsListResponse = { success: boolean; data: MockComment[] };

export type CommentsCreatePayload = {
  post_id: number;
  text: string;
  parent_comment_id: number | null;
  media: unknown;
};
export type CommentsCreateResponse = { success: boolean; data: MockComment };

export type CommentsUpdatePayload = {
  comment_id: number;
  text: string;
  media: unknown;
};
export type CommentsUpdateResponse = { success: boolean; data: MockComment };

export type CommentsDeletePayload = { comment_id: number };
export type CommentsDeleteResponse = { success: boolean };

export type CommentsLikePayload = { comment_id: number };
export type CommentsLikeResponse = {
  success: boolean;
  status: 'added' | 'removed';
  like_count: number;
};

export const commentsListRequests: Array<{ payload: CommentsListPayload }> = [];
export const commentsCreateRequests: Array<{ payload: CommentsCreatePayload }> = [];
export const commentsUpdateRequests: Array<{ payload: CommentsUpdatePayload }> = [];
export const commentsDeleteRequests: Array<{ payload: CommentsDeletePayload }> = [];
export const commentsLikeRequests: Array<{ payload: CommentsLikePayload }> = [];

export function resetCommentsHandlersHistory() {
  commentsListRequests.length = 0;
  commentsCreateRequests.length = 0;
  commentsUpdateRequests.length = 0;
  commentsDeleteRequests.length = 0;
  commentsLikeRequests.length = 0;
}

function createMockComment(overrides: Partial<MockComment> = {}): MockComment {
  return {
    id: 1,
    user_id: 'user-1',
    post_id: 1,
    parent_comment_id: null,
    text: 'A comment',
    media: null,
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
    like_count: 0,
    user_has_liked: false,
    user: { raw_user_meta_data: { nickname: 'TestUser', avatar_url: null } },
    ...overrides,
  };
}

const defaultListComment = createMockComment({
  id: 100,
  text: 'Existing comment',
  like_count: 2,
  user_has_liked: false,
});

let nextCommentId = 1000;

export const listCommentsHandler = http.get(`${BASE}/user-comments`, ({ request }) => {
  const url = new URL(request.url);
  const postId = Number(url.searchParams.get('post_id'));
  const payload: CommentsListPayload = { post_id: postId };
  commentsListRequests.push({ payload });
  const response: CommentsListResponse = {
    success: true,
    data: [defaultListComment],
  };
  return HttpResponse.json(response, { headers: CORS_HEADERS });
});

export const createCommentHandler = http.post(
  `${BASE}/user-comments`,
  async ({ request }) => {
    const payload = (await request.json()) as CommentsCreatePayload;
    commentsCreateRequests.push({ payload });
    const comment: MockComment = createMockComment({
      id: nextCommentId++,
      post_id: payload.post_id,
      parent_comment_id: payload.parent_comment_id,
      text: payload.text,
      media: payload.media,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const response: CommentsCreateResponse = { success: true, data: comment };
    return HttpResponse.json(response, { headers: CORS_HEADERS });
  },
);

export const updateCommentHandler = http.patch(
  `${BASE}/user-comments`,
  async ({ request }) => {
    const payload = (await request.json()) as CommentsUpdatePayload;
    commentsUpdateRequests.push({ payload });
    const comment: MockComment = createMockComment({
      id: payload.comment_id,
      text: payload.text,
      media: payload.media,
      updated_at: new Date().toISOString(),
    });
    const response: CommentsUpdateResponse = { success: true, data: comment };
    return HttpResponse.json(response, { headers: CORS_HEADERS });
  },
);

export const deleteCommentHandler = http.delete(
  `${BASE}/user-comments`,
  async ({ request }) => {
    const payload = (await request.json()) as CommentsDeletePayload;
    commentsDeleteRequests.push({ payload });
    const response: CommentsDeleteResponse = { success: true };
    return HttpResponse.json(response, { headers: CORS_HEADERS });
  },
);

export const commentsLikeHandler = http.post(
  `${BASE}/users-comments-like`,
  async ({ request }) => {
    const payload = (await request.json()) as CommentsLikePayload;
    commentsLikeRequests.push({ payload });
    const response: CommentsLikeResponse = {
      success: true,
      status: 'added',
      like_count: 1,
    };
    return HttpResponse.json(response, { headers: CORS_HEADERS });
  },
);
