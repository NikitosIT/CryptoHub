import { useLikedPosts } from "@/api/useLikedPosts";
import LikeButton from "@/components/LikeButton";
import { useLikesStore } from "@/store/useLikesStore";
import { useUserStore } from "@/store/useUserStore";

export default function LikedVideos() {
  const { data: likedPosts, isLoading } = useLikedPosts();
  const { user } = useUserStore();
  const { likeCounts } = useLikesStore();
  if (isLoading) return <p>loading...</p>;

  if (!likedPosts?.length)
    return (
      <p className="mt-8 text-center text-gray-400">
        Пока нет лайкнутых постов 💔
      </p>
    );

  return (
    <div className="flex flex-col gap-6 p-4">
      {likedPosts.map((post: any) => (
        <div key={post.id} className="pb-4 border-b border-gray-700">
          <p className="font-semibold">{post.text_caption}</p>
          {post.media?.length > 0 && (
            <img
              src={post.media[0]?.url}
              alt=""
              className="w-full mt-3 rounded-xl"
            />
          )}
          <p className="mt-2 text-sm text-gray-400">
            <LikeButton
              postId={post.id}
              user={user}
              likeCount={likeCounts[post.id] ?? post.like_count}
            />
          </p>
        </div>
      ))}
    </div>
  );
}
