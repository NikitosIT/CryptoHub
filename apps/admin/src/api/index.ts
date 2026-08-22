import type { Session } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';

import { env } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';
import { type CheckEmailResponse } from '@/routes/auth/-api/signInWithOtp';
import { type ForecastsResponse } from '@/routes/forecasts/api/useForecasts';
import { type UserInfo } from '@/routes/notifications/utils/filterProfiles';
import { type CryptoTokens } from '@/routes/tokens/api/useListCryptoTokens';

type FunctionRequestOptions<TBody> = {
  functionName: string;
  body: TBody;
  requireAuth?: boolean;
};

async function performFunctionRequest<T, TBody = unknown>({
  functionName,
  body,
  requireAuth = false,
}: FunctionRequestOptions<TBody>) {
  const { supabaseFunctionsUrl, supabaseAnonKey } = env;

  if (!supabaseFunctionsUrl) {
    throw new Error('VITE_SUPABASE_FUNCTIONS_URL or VITE_SUPABASE_URL must be set');
  }

  const url = `${supabaseFunctionsUrl}/${functionName}`;

  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not set');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
  };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    headers.Authorization = `Bearer ${supabaseAnonKey}`;
  }

  if (requireAuth && !session?.access_token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data: unknown = await res.json();
  return data as T;
}

async function checkAdminEmail(email: string) {
  return performFunctionRequest<CheckEmailResponse>({
    functionName: 'admin-auth',
    body: { email },
  });
}

async function listForecasts() {
  return performFunctionRequest<ForecastsResponse>({
    functionName: 'admin-forecasts',
    requireAuth: true,
    body: { action: 'list' },
  });
}

async function updateForecastStatus(forecastId: number, status: 'approved' | 'rejected') {
  return performFunctionRequest<void>({
    functionName: 'admin-forecasts',
    requireAuth: true,
    body: {
      action: 'update',
      forecastId,
      status,
    },
  });
}

async function updateForecastText(forecastId: number, forecast_text: string) {
  return performFunctionRequest<void>({
    functionName: 'admin-forecasts',
    requireAuth: true,
    body: {
      action: 'update',
      forecastId,
      forecast_text,
    },
  });
}

type SendNotificationPayload = {
  send_to: string;
  send_to_all: boolean;
  msg: string;
  links?: unknown;
};

async function sendNotification(payload: SendNotificationPayload) {
  return performFunctionRequest<void>({
    functionName: 'admin_notifications',
    requireAuth: true,
    body: payload,
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (payload: SendNotificationPayload) =>
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
    type: 'email',
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('No session returned');

  return data.session;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return {
    unsubscribe() {
      data.subscription.unsubscribe();
    },
  };
}

async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, profile_logo');
  if (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }

  return data as UserInfo[];
}

export async function cryptoTokens() {
  return performFunctionRequest<CryptoTokens[]>({
    functionName: 'crypto-tokens',
    body: {},
    requireAuth: true,
  });
}

export async function insertCryptoToken(tokenName: string) {
  return performFunctionRequest({
    functionName: 'admin_cryptotokens',
    body: { token_name: tokenName },
    requireAuth: true,
  });
}

export async function insertCryptoTokens(tokenNames: string[]) {
  return performFunctionRequest({
    functionName: 'admin_cryptotokens',
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
  getSession,
  listForecasts,
  onAuthStateChange,
  signInWithOtp,
  signOut,
  updateForecastStatus,
  updateForecastText,
  verifyOtp,
};
