export const ROUTE_SEGMENTS = {
  root: "/",
  authWildcard: "/auth/*splat",
  ingestion: "/ingestion",
  openApiJson: "/openapi.json",
} as const;

export const APP_ROUTES = {
  adminQueues: "/admin/queues",
  api: "/api",
  docs: "/docs",
  health: "/health",
  metrics: "/metrics",
} as const;

export const API_ROUTE_SEGMENTS = {
  auth: "/auth",
  cryptotokens: "/cryptotokens",
  telegramPostIngestion: "/telegram-post-ingestion",
  telegramPosts: "/telegram-posts",
} as const;

export const API_ROUTES = {
  auth: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.auth}`,
  cryptotokens: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.cryptotokens}`,
  telegramPostIngestion: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.telegramPostIngestion}`,
  telegramPosts: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.telegramPosts}`,
} as const;
