import { useSearch } from '@tanstack/react-router';

const POST_MODES = ['all', 'liked', 'disliked', 'favorites'] as const;

export type PostMode = (typeof POST_MODES)[number];

const isPostMode = (value: unknown): value is PostMode =>
  typeof value === 'string' && POST_MODES.includes(value as PostMode);

export const usePostsMode = (): { mode: PostMode } => {
  const search = useSearch({ strict: false });

  return {
    mode: isPostMode(search.mode) ? search.mode : 'all',
  };
};
