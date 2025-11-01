import { useTelegramPosts } from "@/api/useTelegramPosts";

export default function NoPostsMessage({ tokenName }: { tokenName: string }) {
  const { data, isLoading } = useTelegramPosts({ tokenName });
  if (isLoading) return null;
  const hasPosts = data?.pages?.some((page) => page.length > 0);
  if (!hasPosts)
    return (
      <p className="px-6 py-3 mt-6 text-base text-center text-gray-400 rounded-xlshadow-inner shadow-black/30">
        ❌ Нет постов про{" "}
        <span className="font-semibold text-white ">{tokenName}</span>
      </p>
    );

  return null;
}
