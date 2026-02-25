import { useAuthState } from '@/routes/auth/-hooks/useAuthState';
import { useSelectedToken } from '@/store/useFiltersStore';

import { useTelegramPosts } from '../-api/useListTelegramPosts';

export default function NoPostsTokenMessage() {
  const { selectedToken } = useSelectedToken();
  const { isLoading } = useAuthState();
  const { data: postsData } = useTelegramPosts();

  const hasPosts = postsData?.pages.some((page) => page.length > 0) ?? false;
  if (isLoading) return null;
  if (!hasPosts) {
    const message = selectedToken ? (
      <>
        No posts about{' '}
        <span className="font-semibold text-white">{selectedToken.label}</span>
      </>
    ) : (
      'No posts yet'
    );
    return (
      <p className="px-6 py-3 mt-6 text-base text-center text-gray-400 rounded-xl shadow-inner shadow-black/30">
        ❌ {message}
      </p>
    );
  }

  return null;
}
