import { TG_LINK, TG_YOUTUBE } from "@/constants/links";
import type { TelegramPost } from "@/types/db";

import { PostBody } from "./PostBody";

export function PostCard({ post }: { post: TelegramPost }) {
  const authorLogo = `/authors/${post.tg_author_id}.jpg`;
  const hasLogo = !!post.tg_author_id;
  const isYouTube = post.author_link.startsWith("@");

  const linkUrl = isYouTube
    ? `${TG_YOUTUBE}${post.author_link}`
    : `${TG_LINK}${post.author_link}`;

  const displayAuthorName =
    post.author_name.length > 20
      ? `${post.author_name.slice(0, 20)}...`
      : post.author_name;

  return (
    <div className="pb-12 border-b border-gray-800 sm:pb-12 md:pb-16 lg:pb-24">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl px-2 sm:px-4">
          <article key={post.id}>
            {/* Author - above post, left */}
            <header className="flex items-center gap-2 mt-3 mb-3 sm:gap-3 sm:mt-4 sm:mb-4">
              {hasLogo ? (
                <img
                  src={authorLogo}
                  alt={post.author_name}
                  className="block object-cover border rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0"
                  onError={(e) =>
                    (e.currentTarget.src = `/authors/${post.tg_author_id}.png`)
                  }
                />
              ) : null}

              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-semibold text-white truncate transition-colors duration-200 sm:text-base font-montserratt hover:text-blue-400"
                style={{ lineHeight: "1.2" }}
                title={post.author_name}
              >
                {displayAuthorName}
              </a>
            </header>

            {/* Post content */}
            <div>
              <PostBody post={post} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
