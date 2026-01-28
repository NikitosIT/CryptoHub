import type { Session, User } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";

import { CMC_LINK, COINGLASS_LINK, HOME_LINK, X_LINK } from "@/constants/links";
import {
  COMMENT_MEDIA_BUCKET,
  USER_AVATARS_BUCKET,
  USER_LOGO_PREFIX,
} from "@/constants/storage";
import { supabase } from "@/lib/supabaseClient";
import type { Author, CommentMedia, TelegramPost, Token } from "@/types/db";

import { twoFactorStatusQueryKey } from "../routes/auth/-api/use2faApi.ts";

type InFlightKey = string;
const inFlight = new Map<InFlightKey, Promise<unknown>>();

interface FunctionRequestOptions {
  functionName: string;
  action?: string;
  body: unknown;
  key: InFlightKey;
  requireAuth?: boolean;
}

function performFunctionRequest<T>({
  functionName,
  action,
  body,
  key,
  requireAuth = false,
}: FunctionRequestOptions): Promise<T> {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const functionsBaseUrl: string =
    (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ||
    `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;

  if (!functionsBaseUrl) {
    throw new Error(
      "VITE_SUPABASE_FUNCTIONS_URL or VITE_SUPABASE_URL must be set",
    );
  }

  const url = action
    ? `${functionsBaseUrl}/${functionName}?action=${action}`
    : `${functionsBaseUrl}/${functionName}`;

  const promise = (async () => {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
      | string
      | undefined;
    if (!anonKey) {
      throw new Error("VITE_SUPABASE_ANON_KEY is not set");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      apikey: anonKey,
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    } else {
      headers["Authorization"] = `Bearer ${anonKey}`;
    }

    if (requireAuth && !session?.access_token) {
      throw new Error("Authentication required");
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      error?: string;
      remainingAttempts?: number;
    } & T;
    if (!res.ok) {
      const error = new Error(data.error || "Request failed") as Error & {
        remainingAttempts?: number;
      };
      if (data.remainingAttempts !== undefined) {
        error.remainingAttempts = data.remainingAttempts;
      }
      throw error;
    }
    return data as T;
  })().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}

export interface CreateCommentParams {
  postId: number;
  text: string;
  userId: string;
  parentCommentId?: number | null;
  media?: CommentMedia[] | null;
}

export interface UpdateCommentParams {
  commentId: number;
  text: string;
  userId: string;
  media?: CommentMedia[] | null;
}

export type ReactionType = "like" | "dislike";

export interface ToggleReactionsParams {
  postId: number;
  reactionType: ReactionType;
  userId: string;
}

export type TwoFactorStatusResponse = {
  enabled: boolean;
  is_verified_for_current_session: boolean;
};

export type EnableTwoFactorResponse = {
  qrUrl: string;
};

export interface UpdateProfilePayload {
  user_id: string;
  nickname?: string;
  profile_logo?: string;
}

export interface UpdateProfileResponse {
  nickname?: string | null;
  profile_logo?: string | null;
  next_nickname_change_date?: string | null;
}

// Comments functions
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_MEDIA_FILES = 4;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
] as const;

async function uploadCommentMedia(files: File[]): Promise<CommentMedia[]> {
  if (files.length === 0) {
    return [];
  }

  if (files.length > MAX_MEDIA_FILES) {
    throw new Error(`Maximum ${MAX_MEDIA_FILES} files per comment`);
  }

  const uploadedMedia: CommentMedia[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" exceeds maximum size of 5MB`);
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    );
    const isVideo = ALLOWED_VIDEO_TYPES.includes(
      file.type as (typeof ALLOWED_VIDEO_TYPES)[number],
    );

    if (!isImage && !isVideo) {
      throw new Error(
        `Unsupported file type "${file.name}". Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, MOV) are allowed`,
      );
    }

    const { generateUUID } = await import("@/utils/uuid");
    const fileId = generateUUID();
    const ext =
      file.name.split(".").pop() ||
      (file.type.startsWith("video/") ? "mp4" : "jpg");
    const filename = `${fileId}.${ext}`;

    // eslint-disable-next-line no-await-in-loop
    const { error: uploadError } = await supabase.storage
      .from(COMMENT_MEDIA_BUCKET)
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload file "${file.name}": ${uploadError.message}`,
      );
    }

    uploadedMedia.push({
      type: file.type.startsWith("video/") ? "video" : "photo",
      url: filename,
    });
  }

  return uploadedMedia;
}

function createComment(params: CreateCommentParams) {
  const { postId, text, userId, parentCommentId, media } = params;
  return performFunctionRequest<{ success: boolean; data: unknown }>({
    functionName: "user-comments",
    action: "create",
    key: `create:${postId}:${userId}`,
    requireAuth: true,
    body: {
      user_id: userId,
      post_id: postId,
      text,
      parent_comment_id: parentCommentId || null,
      media: media || null,
    },
  });
}

function updateComment(params: UpdateCommentParams) {
  const { commentId, text, userId, media } = params;
  return performFunctionRequest<{ success: boolean; data: unknown }>({
    functionName: "user-comments",
    action: "update",
    key: `update:${commentId}:${userId}`,
    requireAuth: true,
    body: {
      user_id: userId,
      comment_id: commentId,
      text,
      media: media || null,
    },
  });
}

function deleteComment(commentId: number, userId: string) {
  return performFunctionRequest<{ success: boolean }>({
    functionName: "user-comments",
    action: "delete",
    key: `delete:${commentId}:${userId}`,
    requireAuth: true,
    body: {
      user_id: userId,
      comment_id: commentId,
    },
  });
}

function listComments(postId: number, userId?: string | null) {
  return performFunctionRequest<{ success: boolean; data: unknown[] }>({
    functionName: "user-comments",
    action: "list",
    key: `list:${postId}:${userId ?? "anon"}`,
    requireAuth: !!userId,
    body: {
      post_id: postId,
      user_id: userId ?? null,
    },
  });
}

// Reaction functions
function toggleFavorite(postId: number, userId: string) {
  return performFunctionRequest<{ success: boolean }>({
    functionName: "toggle-favorites",
    key: `${postId}:${userId}`,
    requireAuth: true,
    body: {
      post_id: postId,
      user_id: userId,
    },
  });
}

function toggleCommentsLike(commentId: number, userId: string | undefined) {
  return performFunctionRequest<{
    success: boolean;
    status: "added" | "removed";
    like_count: number;
  }>({
    functionName: "users-comments-like",
    key: `${commentId}:${userId}:comment-like`,
    requireAuth: true,
    body: {
      comment_id: commentId,
      user_id: userId,
    },
  });
}

function toggleReactions(params: ToggleReactionsParams) {
  const { postId, reactionType, userId } = params;
  return performFunctionRequest<{ success: boolean }>({
    functionName: "toggle-reactions",
    key: `${postId}:${userId}:${reactionType}`,
    requireAuth: true,
    body: {
      post_id: postId,
      reaction_type: reactionType,
      user_id: userId,
    },
  });
}

// 2FA functions
function getTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
  return performFunctionRequest<TwoFactorStatusResponse>({
    functionName: "get-2fa-status",
    key: "get-2fa-status",
    body: {},
    requireAuth: true,
  });
}

function enableTwoFactor(): Promise<EnableTwoFactorResponse> {
  return performFunctionRequest<EnableTwoFactorResponse>({
    functionName: "enable-2fa",
    key: "enable-2fa",
    body: {},
    requireAuth: true,
  });
}

function verifyTwoFactorSetup(code: string): Promise<{
  success?: boolean;
}> {
  return performFunctionRequest<{
    success?: boolean;
  }>({
    functionName: "verify-2fa-setup",
    key: `verify-2fa-setup:${code}`,
    body: { code },
    requireAuth: true,
  });
}

function verifyLogin2FA(code: string): Promise<{
  verified?: boolean;
  is_verified_for_current_session?: boolean;
  error?: string;
  remainingAttempts?: number;
}> {
  return performFunctionRequest<{
    verified?: boolean;
    is_verified_for_current_session?: boolean;
    error?: string;
    remainingAttempts?: number;
  }>({
    functionName: "verify-login-2fa",
    key: `verify-login-2fa:${code}`,
    body: { code },
    requireAuth: true,
  });
}

function disableTwoFactor(code: string): Promise<{
  success?: boolean;
}> {
  return performFunctionRequest<{ success?: boolean }>({
    functionName: "disable-2fa",
    key: `disable-2fa:${code}`,
    body: { code },
    requireAuth: true,
  });
}

function clearTwoFactorVerification(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  return performFunctionRequest<{
    success: boolean;
    message?: string;
    error?: string;
  }>({
    functionName: "clear-2fa-verification",
    key: "clear-2fa-verification",
    body: {},
    requireAuth: true,
  });
}

// Profile functions
interface UserProfile {
  nickname: string | null;
  profile_logo: string | null;
  last_changed?: string | null;
}

async function getUserProfile(
  userId: string | undefined,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("nickname, profile_logo, last_changed")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return data as UserProfile | null;
}

async function uploadProfileLogo(
  userId: string,
  file: File,
  encryption: string,
): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required for logo upload");
  }

  const { error: uploadError } = await supabase.storage
    .from(USER_AVATARS_BUCKET)
    .upload(`${USER_LOGO_PREFIX}${encryption}.png`, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;
}

function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  return performFunctionRequest<UpdateProfileResponse>({
    functionName: "update-profile",
    key: `update-profile:${payload.user_id}`,
    body: payload,
    requireAuth: true,
  });
}

// Tokens functions
async function listTokens(): Promise<Token[]> {
  const { data, error } = await supabase
    .from("cryptotokens")
    .select("*")
    .overrideTypes<
      Array<{
        token_name: string;
        cmc_link: string;
        home_link: string;
        x_link: string;
      }>
    >();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return data.map(
    (token: {
      token_name: string;
      cmc_link: string;
      home_link: string;
      x_link: string;
    }) => ({
      label: token.token_name,
      value: token.token_name,
      cmc: `${CMC_LINK}${token.cmc_link}`,
      coinglass: `${COINGLASS_LINK}${token.token_name}`,
      homelink: `${HOME_LINK}${token.home_link}`,
      xlink: `${X_LINK}${token.x_link}`,
    }),
  );
}

async function getTokenForecast(
  tokenName: string,
): Promise<Record<string, unknown> | null> {
  if (!tokenName) return null;

  const { data, error } = await supabase
    .from("token_forecasts")
    .select("*")
    .eq("token_name", tokenName)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .overrideTypes<Record<string, unknown> | null>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

// Authors functions
async function listAuthors(): Promise<Author[]> {
  const { data, error } = await supabase
    .from("authors")
    .select("author_name, tg_author_id");
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return data.map((author: { author_name: string; tg_author_id: number }) => ({
    label: author.author_name,
    id: author.tg_author_id,
  }));
}

// Posts functions
interface FetchTelegramPostParams {
  cursorId: number | null;
  cursorCreatedAt: string | null;
  limit?: number;
  mode?: "all" | "liked" | "disliked" | "favorites";
  authorId?: number | null;
  tokenName?: string | null;
  userId?: string | null;
}

async function fetchTelegramPost(
  params: FetchTelegramPostParams,
): Promise<TelegramPost[]> {
  const {
    cursorCreatedAt,
    cursorId,
    authorId = null,
    tokenName = null,
    mode = "all",
    limit = 10,
  } = params;

  const { data, error } = (await supabase.rpc("fetch_telegram_posts", {
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
          typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unknown error occurred",
        );
  }
  return data ?? [];
}

// Auth functions
async function getSession(): Promise<Session | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session ?? null;
}

async function signInWithOtp(email: string): Promise<string> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    throw new Error(error.message);
  }
  return email;
}

async function verifyOtp(email: string, code: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error("No session returned");

  return data.session;
}

async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return {
    unsubscribe: () => data.subscription.unsubscribe(),
  };
}

interface AuthStateData {
  user: User | undefined;
  hasPendingTwoFactor: boolean;
  isAuthenticatedWith2FA: boolean;
}

function calculateAuthState(
  session: Session | null,
  checkTwoFactor: boolean,
  twoFactorStatus: TwoFactorStatusResponse | null | undefined,
): AuthStateData {
  const user = session?.user;
  const isAuthenticated = Boolean(user?.id);
  const shouldCheckTwoFactor = checkTwoFactor && isAuthenticated;

  const isTwoFactorEnabled =
    shouldCheckTwoFactor && (twoFactorStatus?.enabled ?? false);
  const isTwoFactorVerified = shouldCheckTwoFactor
    ? (twoFactorStatus?.is_verified_for_current_session ?? false)
    : true;

  const hasPendingTwoFactor = isTwoFactorEnabled && !isTwoFactorVerified;
  const isAuthenticatedWith2FA = isAuthenticated && !hasPendingTwoFactor;

  return {
    user,
    hasPendingTwoFactor,
    isAuthenticatedWith2FA,
  };
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
    list: listTokens,
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
  },
} as const;

export { calculateAuthState };

export type { AuthStateData, FetchTelegramPostParams, UserProfile };
