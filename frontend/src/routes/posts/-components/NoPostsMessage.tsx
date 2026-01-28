import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useFiltersForMode } from "@/store/useFiltersStore";

import { useTelegramPosts } from "../-api/useListTelegramPosts";

export default function NoPostsTokenMessage() {
  const { selectedToken } = useFiltersForMode();
  const { isLoading } = useAuthState();
  const { data: postsData } = useTelegramPosts();

  const hasPosts = postsData?.pages.some((page) => page.length > 0) ?? false;
  if (isLoading) return null;
  if (!hasPosts)
    return (
      <p className="px-6 py-3 mt-6 text-base text-center text-gray-400 rounded-xlshadow-inner shadow-black/30">
        ❌ No posts about{" "}
        <span className="font-semibold text-white ">
          {selectedToken?.label}
        </span>
      </p>
    );

  return null;
}
