export const ROUTE_SEGMENTS = {
  root: "/",
  authWildcard: "/auth/*splat",
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
  telegram: "/telegram",
  posts: "/posts",
  favorites: "/:postId/favorites",
  reactions: "/:postId/reactions",
  comments: "/:postId/comments",
} as const;

export const API_ROUTES = {
  auth: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.auth}`,
  cryptotokens: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.cryptotokens}`,
  telegram: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.telegram}`,
  posts: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.posts}`,
  favorites: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.posts}${API_ROUTE_SEGMENTS.favorites}`,
  reactions: `${APP_ROUTES.api}${API_ROUTE_SEGMENTS.posts}${API_ROUTE_SEGMENTS.reactions}`,
} as const;
