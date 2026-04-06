export const ROUTES = {
  MAIN: '/',
  AUTH: {
    INDEX: '/auth/',
    VERIFY: '/auth/verify',
    VERIFY2FA: '/auth/verify-2fa',
    CALLBACK: '/auth/callback',
    SETNICKNAME: '/auth/setnickname',
  },
  PROFILE: {
    INDEX: '/profile/',
    EDIT: '/profile/edit',
    NOTIFICATIONS: '/profile/notifications',
    TWOFACTOR: '/profile/twofactor',
  },
  POSTS: {
    INDEX: '/posts',
    LIKED: 'liked',
    DISLIKED: 'disliked',
    FAVORITES: 'favorites',
  },
  CALCULATOR: {
    INDEX: '/calculator/',
    SPOT: '/calculator/spot',
    FUTURES: '/calculator/futures',
  },
  HELP: '/help/',
} as const;
