import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import type { ForecastsResponse, CheckEmailResponse } from "@/types/admin";

interface FunctionRequestOptions {
  functionName: string;
  body: unknown;
  requireAuth?: boolean;
}

async function performFunctionRequest<T>({
  functionName,
  body,
  requireAuth = false,
}: FunctionRequestOptions): Promise<T> {
  const functionsBaseUrl: string =
    (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ||
    `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1`;

  if (!functionsBaseUrl) {
    throw new Error(
      "VITE_SUPABASE_FUNCTIONS_URL or VITE_SUPABASE_URL must be set"
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

  const data = (await res.json()) as {
    error?: string;
  } & T;
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}

function checkAdminEmail(email: string): Promise<CheckEmailResponse> {
  return performFunctionRequest<CheckEmailResponse>({
    functionName: "admin-auth",
    body: { email },
  });
}

function listForecasts(): Promise<ForecastsResponse> {
  return performFunctionRequest<ForecastsResponse>({
    functionName: "admin-forecasts",
    requireAuth: true,
    body: { action: "list" },
  });
}

function updateForecastStatus(
  forecastId: number,
  status: "approved" | "rejected"
): Promise<void> {
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

function updateForecastText(
  forecastId: number,
  forecast_text: string
): Promise<void> {
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
  callback: (event: string, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return {
    unsubscribe: () => data.subscription.unsubscribe(),
  };
}

export const api = {
  admin: {
    checkEmail: checkAdminEmail,
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
