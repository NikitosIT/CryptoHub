import type { TelegramPost } from "@/types/db";
import { TelegramCaption } from "./PostBody";

export function PostCard({ post }: { post: TelegramPost }) {
  const authorLogo = `/authors/${post.tg_author_id}.jpg`;
  const hasLogo = !!post.tg_author_id;
  return (
    <article key={post.id} className="pb-8 border-b border-gray-800">
      {/* Автор */}
      <header className="flex items-center gap-3 mb-3">
        {hasLogo && (
          <img
            src={authorLogo}
            alt={post.author_name}
            className="object-cover border border-gray-700 rounded-full w-9 h-9"
            onError={(e) =>
              (e.currentTarget.src = `/authors/${post.tg_author_id}.png`)
            }
          />
        )}

        <a
          href={post.author_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-white transition-colors duration-200 hover:text-blue-400"
        >
          {post.author_name}
        </a>
      </header>

      {/* Контент поста */}
      <div className="p-4 border shadow-sm rounded-xl">
        <TelegramCaption post={post} />
      </div>
    </article>
  );
}
