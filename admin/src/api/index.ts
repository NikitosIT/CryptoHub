import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";

import { useMutation } from "@tanstack/react-query";
import { CryptoTokens } from "@/routes/tokens/api/useListCryptoTokens";
import { UserInfo } from "@/routes/notifications/utils/filterProfiles";
import { ForecastsResponse } from "@/routes/forecasts/api/useForecasts";
import { CheckEmailResponse } from "@/routes/auth/-api/signInWithOtp";

interface FunctionRequestOptions<TBody> {
  functionName: string;
  body: TBody;
  requireAuth?: boolean;
}

async function performFunctionRequest<T, TBody = unknown>({
  functionName,
  body,
  requireAuth = false,
}: FunctionRequestOptions<TBody>) {
  const functionsBaseUrl: string =
    (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ||
    `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;

  if (!functionsBaseUrl) {
    throw new Error(
      "VITE_SUPABASE_FUNCTIONS_URL or VITE_SUPABASE_URL must be set",
    );
  }

  const url = `${functionsBaseUrl}/${functionName}`;

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
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

  const data: unknown = await res.json();
  return data as T;
}

function checkAdminEmail(email: string) {
  return performFunctionRequest<CheckEmailResponse>({
    functionName: "admin-auth",
    body: { email },
  });
}

function listForecasts() {
  return performFunctionRequest<ForecastsResponse>({
    functionName: "admin-forecasts",
    requireAuth: true,
    body: { action: "list" },
  });
}

function updateForecastStatus(
  forecastId: number,
  status: "approved" | "rejected",
) {
  return performFunctionRequest<void>({
    functionName: "admin-forecasts",
    requireAuth: true,
    body: {
      action: "update",
      forecastId,
      status,
    },
  });
}

function updateForecastText(forecastId: number, forecast_text: string) {
  return performFunctionRequest<void>({
    functionName: "admin-forecasts",
    requireAuth: true,
    body: {
      action: "update",
      forecastId,
      forecast_text,
    },
  });
}

interface SendNotificationPayload {
  send_to: string;
  send_to_all: boolean;
  msg: string;
  links?: unknown;
}

function sendNotification(payload: SendNotificationPayload) {
  return performFunctionRequest<void>({
    functionName: "admin_notifications",
    requireAuth: true,
    body: payload,
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (payload: SendNotificationPayload) =>
      api.admin.sendNotification(payload),
  });
}

async function getSession() {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session ?? null;
}

async function signInWithOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    throw new Error(error.message);
  }
  return email;
}

async function verifyOtp(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error("No session returned");

  return data.session;
}

async function signOut() {
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

async function listProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, profile_logo");
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
  return (data ?? []) as UserInfo[];
}

export async function cryptoTokens() {
  return performFunctionRequest<CryptoTokens[]>({
    functionName: "crypto-tokens",
    body: {},
    requireAuth: true,
  });
}

export function insertCryptoToken(tokenName: string) {
  return performFunctionRequest({
    functionName: "admin_cryptotokens",
    body: { token_name: tokenName },
    requireAuth: true,
  });
}

export function insertCryptoTokens(tokenNames: string[]) {
  return performFunctionRequest({
    functionName: "admin_cryptotokens",
    body: { token_names: tokenNames },
    requireAuth: true,
  });
}

export const api = {
  admin: {
    checkEmail: checkAdminEmail,
    listProfiles,
    sendNotification,
    forecasts: {
      list: listForecasts,
      updateStatus: updateForecastStatus,
      updateText: updateForecastText,
    },
  },
  auth: {
    getSession,
    signInWithOtp,
    verifyOtp,
    signOut,
    onStateChange: onAuthStateChange,
  },
  tokens: {
    cryptoTokens,
    insertOne: insertCryptoToken,
    insertAll: insertCryptoTokens,
  },
} as const;

export {
  checkAdminEmail,
  listForecasts,
  updateForecastStatus,
  updateForecastText,
  getSession,
  signInWithOtp,
  verifyOtp,
  signOut,
  onAuthStateChange,
};
