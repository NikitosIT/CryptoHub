import type { Session } from '@supabase/supabase-js';
import { type QueryClient } from '@tanstack/react-query';

import { env } from '@/config/env';
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from '@/constants/comments.ts';
import {
  COMMENT_MEDIA_BUCKET,
  USER_AVATARS_BUCKET,
  USER_LOGO_PREFIX,
} from '@/constants/storage';
import { supabase } from '@/lib/supabaseClient';
import type { AuthStateData } from '@/routes/auth/-hooks/useAuthState.ts';
import { calculateAuthState } from '@/routes/auth/utils/calculateAuthState.ts';
import type { Author } from '@/routes/authors/-api/useListAuthors.ts';
import type { FetchTelegramPostParams } from '@/routes/posts/-api/useListTelegramPosts.ts';
import type { CreateCommentParams } from '@/routes/posts/-comments/-api/useCommentCreate.ts';
import type { UpdateCommentParams } from '@/routes/posts/-comments/-api/useCommentUpdate.ts';
import type { CommentMedia } from '@/routes/posts/-comments/-types/comments-db.ts';
import type { ToggleReactionsParams } from '@/routes/posts/-reactions/-types/reactions-type.ts';
import type { UpdateProfile } from '@/routes/profile/-api/useUpdateProfile.ts';
import type { UserNotifications } from '@/routes/profile/-api/useUserNotifications.ts';
import type { UserProfile } from '@/routes/profile/-api/useUserProfile.ts';
import type { CryptoTokens } from '@/routes/tokens/-api/useListCryptoTokens.ts';
import type { TokenForecast } from '@/routes/tokens/-api/useTokensAiForecasts.ts';
import type { Code, Email, TelegramPost } from '@/types/db';
import { parseError } from '@/utils/errorUtils.ts';

import {
  type EnableTwoFactorResponse,
  twoFactorStatusQueryKey,
  type TwoFactorStatusResponse,
  type VerifyLogin2FA,
} from '../routes/auth/-api/use2faApi.ts';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface FunctionRequestOptions<TBody = unknown> {
  functionName: string;
  method?: HttpMethod;
  query?: Record<string, string>;
  body?: TBody;
  requireAuth?: boolean;
}

async function functionRequest<TResponse, TBody = unknown>({
  functionName,
  method = 'POST',
  query,
  body,
  requireAuth = false,
}: FunctionRequestOptions<TBody>): Promise<TResponse> {
  const { supabaseFunctionsUrl, supabaseAnonKey } = env;

  const params = query ? `?${new URLSearchParams(query)}` : '';
  const url = `${supabaseFunctionsUrl}/${functionName}${params}`;

  const session = await getSession();
  if (requireAuth && !session?.access_token) throw new Error('Authentication required');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${session?.access_token ?? supabaseAnonKey}`,
  };

  const hasBody = method !== 'GET' && body !== undefined;
  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const data: unknown = await res.json();

  if (!res.ok) {
    const errorInfo = parseError(data);
    const error = new Error(errorInfo.message) as Error & { remainingAttempts?: number };
    if (errorInfo.remainingAttempts !== undefined)
      error.remainingAttempts = errorInfo.remainingAttempts;
    throw error;
  }

  return data as TResponse;
}

function uploadCommentMedia(files: File[]): Promise<CommentMedia[]> {
  if (files.length === 0) {
    return Promise.resolve([]);
  }

  const uploadPromises = files.map(async (file) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error(
        `Unsupported file type "${file.name}". Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, MOV) are allowed`,
      );
    }

    const fileId = crypto.randomUUID();
    const ext =
      file.name.split('.').pop() || (file.type.startsWith('video/') ? 'mp4' : 'jpg');
    const filename = `${fileId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(COMMENT_MEDIA_BUCKET)
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file "${file.name}": ${uploadError.message}`);
    }

    const mediaType: 'video' | 'photo' = file.type.startsWith('video/')
      ? 'video'
      : 'photo';
    return {
      type: mediaType,
      url: filename,
    };
  });

  return Promise.all(uploadPromises);
}

function createComment(params: CreateCommentParams) {
  const { postId, text, parentCommentId, media } = params;
  return functionRequest<{ success: boolean; data: unknown }>({
    functionName: 'user-comments',
    requireAuth: true,
    body: {
      post_id: postId,
      text,
      parent_comment_id: parentCommentId || null,
      media: media || null,
    },
  });
}

function updateComment(params: UpdateCommentParams) {
  const { commentId, text, media } = params;
  return functionRequest<{ success: boolean; data: unknown }>({
    functionName: 'user-comments',
    method: 'PATCH',
    requireAuth: true,
    body: {
      comment_id: commentId,
      text,
      media: media || null,
    },
  });
}

function deleteComment(commentId: number) {
  return functionRequest<{ success: boolean }>({
    functionName: 'user-comments',
    method: 'DELETE',
    requireAuth: true,
    body: {
      comment_id: commentId,
    },
  });
}

function listComments(postId: number) {
  return functionRequest<{ success: boolean; data: unknown[] }>({
    functionName: 'user-comments',
    method: 'GET',
    query: { post_id: String(postId) },
  });
}

function toggleFavorite(postId: number) {
  return functionRequest<{ success: boolean }>({
    functionName: 'toggle-favorites',
    requireAuth: true,
    body: {
      post_id: postId,
    },
  });
}

function toggleCommentsLike(commentId: number) {
  return functionRequest<{
    success: boolean;
    status: 'added' | 'removed';
    like_count: number;
  }>({
    functionName: 'users-comments-like',
    requireAuth: true,
    body: {
      comment_id: commentId,
    },
  });
}

function toggleReactions(params: ToggleReactionsParams) {
  const { postId, reactionType } = params;
  return functionRequest<{ success: boolean }>({
    functionName: 'toggle-reactions',
    requireAuth: true,
    body: {
      post_id: postId,
      reaction_type: reactionType,
    },
  });
}

function getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
  return functionRequest<TwoFactorStatusResponse>({
    functionName: 'get-2fa-status',
    body: {},
    requireAuth: true,
  });
}

function enableTwoFactor(): Promise<EnableTwoFactorResponse> {
  return functionRequest<EnableTwoFactorResponse>({
    functionName: 'enable-2fa',
    body: {},
    requireAuth: true,
  });
}

function verifyTwoFactorSetup(code: string): Promise<{
  success?: boolean;
}> {
  return functionRequest<{
    success?: boolean;
  }>({
    functionName: 'verify-2fa-setup',
    body: { code },
    requireAuth: true,
  });
}

function verifyLogin2FA(code: string): Promise<VerifyLogin2FA> {
  return functionRequest<VerifyLogin2FA>({
    functionName: 'verify-login-2fa',
    body: { code },
    requireAuth: true,
  });
}

function disableTwoFactor(code: string): Promise<{
  success?: boolean;
}> {
  return functionRequest<{ success?: boolean }>({
    functionName: 'disable-2fa',
    body: { code },
    requireAuth: true,
  });
}

export interface TwoFactorApiResponse {
  success: boolean;
  message?: string;
  error?: Error;
}

function clearTwoFactorVerification(): Promise<TwoFactorApiResponse> {
  return functionRequest<TwoFactorApiResponse>({
    functionName: 'clear-2fa-verification',
    body: {},
    requireAuth: true,
  });
}

async function getUserProfile(userId: string | undefined): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('nickname, profile_logo, last_changed')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return data as UserProfile | null;
}

async function getNotifications(): Promise<UserNotifications[]> {
  const { data, error } = await supabase
    .from('notification_users')
    .select('id, send_to, send_to_all, msg, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return data as UserNotifications[];
}

async function uploadProfileLogo(file: File, encryption: string): Promise<void> {
  const { error: uploadError } = await supabase.storage
    .from(USER_AVATARS_BUCKET)
    .upload(`${USER_LOGO_PREFIX}${encryption}.png`, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;
}

function updateProfile(payload: UpdateProfile): Promise<UpdateProfile> {
  return functionRequest<UpdateProfile>({
    functionName: 'update-profile',
    body: payload,
    requireAuth: true,
  });
}

async function getTokenForecast(tokenName: string): Promise<TokenForecast | null> {
  if (!tokenName) return null;

  const { data, error } = await supabase
    .from('token_forecasts')
    .select('*')
    .eq('token_name', tokenName)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .overrideTypes<TokenForecast[]>();

  if (error) throw new Error(error.message);
  return data[0] ?? null;
}

async function listAuthors(): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('label:author_name, id:tg_author_id')
    .overrideTypes<Author[]>();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return data;
}

async function fetchTelegramPost(
  params: FetchTelegramPostParams,
): Promise<TelegramPost[]> {
  const {
    cursorCreatedAt,
    cursorId,
    authorId = null,
    tokenName = null,
    mode = 'all',
    limit = 10,
  } = params;

  const { data, error } = (await supabase.rpc('fetch_telegram_posts', {
    cursor_created_at: cursorCreatedAt,
    cursor_id: cursorId,
    page_limit: limit,
    author_id: authorId,
    token_name: tokenName,
    mode: mode,
  })) as { data: TelegramPost[] | null; error: unknown };

  if (error) {
    throw error instanceof Error
      ? error
      : new Error(
          typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Unknown error occurred',
        );
  }
  return data ?? [];
}

async function signInWithOtp(email: Email): Promise<string> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    throw new Error(error.message);
  }
  return email;
}

async function verifyOtp(email: Email, code: Code): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('No session returned');

  return data.session;
}

async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return {
    unsubscribe: () => data.subscription.unsubscribe(),
  };
}

export async function getSession(): Promise<Session | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session ?? null;
}

async function getAuthState(queryClient?: QueryClient): Promise<AuthStateData> {
  const session = await getSession();
  const userId = session?.user.id;

  const DEFAULT_TWO_FACTOR_STATUS: TwoFactorStatusResponse = {
    enabled: false,
    is_verified_for_current_session: true,
  };

  let twoFactorStatus: TwoFactorStatusResponse | null = null;
  if (userId) {
    try {
      if (queryClient) {
        twoFactorStatus = await queryClient.ensureQueryData({
          queryKey: twoFactorStatusQueryKey(userId),
          queryFn: () => getTwoFactorStatus(),
          staleTime: Infinity,
        });
      } else {
        twoFactorStatus = await getTwoFactorStatus();
      }
    } catch {
      twoFactorStatus = DEFAULT_TWO_FACTOR_STATUS;
    }
  }

  return calculateAuthState(session, true, twoFactorStatus);
}

export async function cryptoTokens(): Promise<CryptoTokens[]> {
  return functionRequest<CryptoTokens[]>({
    functionName: 'crypto-tokens',
    body: {},
    requireAuth: false,
  });
}

export const api = {
  comments: {
    create: createComment,
    update: updateComment,
    delete: deleteComment,
    list: listComments,
    uploadMedia: uploadCommentMedia,
  },
  reactions: {
    toggleFavorite,
    toggleCommentsLike,
    toggle: toggleReactions,
  },
  twoFactor: {
    getStatus: getTwoFactorStatus,
    enable: enableTwoFactor,
    verifySetup: verifyTwoFactorSetup,
    verifyLogin: verifyLogin2FA,
    disable: disableTwoFactor,
    clearVerification: clearTwoFactorVerification,
  },
  tokens: {
    crypto: cryptoTokens,
    getForecast: getTokenForecast,
  },
  authors: {
    list: listAuthors,
  },
  posts: {
    list: fetchTelegramPost,
  },
  auth: {
    getSession,
    getState: getAuthState,
    signInWithOtp,
    verifyOtp,
    signOut,
    onStateChange: onAuthStateChange,
  },
  profile: {
    get: getUserProfile,
    update: updateProfile,
    uploadLogo: uploadProfileLogo,
    getNotifications,
  },
} as const;
