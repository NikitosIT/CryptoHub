import { toHTML } from "@telegraf/entity";
import { normalizeEntities } from "@/utils/normalizeEntities";
import type { MediaGridProps, TelegramPost } from "@/types/db";
import type { MessageEntity } from "@telegraf/entity/types/types";
import { useMemo, useState } from "react";
import { ImageModal } from "./ImageModal";
import { formatDate } from "@/utils/formatDate";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { processLinks } from "@/utils/processLinks";
import { DocumentIcon } from "./DocumentIcon";
import LikeButton from "./LikeButton";
import { useUserStore } from "@/store/useUserStore";
import DislikeButton from "./Dislike";

export function TelegramCaption({ post }: { post: TelegramPost }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const caption = post.text_caption ?? "";
  const entities: MessageEntity[] = normalizeEntities(post.text_entities);
  const rawHtml = toHTML({ text: caption, entities });
  const safeHtml = sanitizeHtml(rawHtml);
  const finalHtml = useMemo(() => processLinks(safeHtml), [safeHtml]);
  const { user } = useUserStore();

  const date = formatDate(post.created_at);
  const MAX_LENGTH = 1000;
  const isLong = caption.length > MAX_LENGTH;
  const visibleHtml =
    isLong && !expanded ? safeHtml.slice(0, MAX_LENGTH) + "..." : finalHtml;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl p-5 mb-6 transition-all bg-white border border-gray-200 shadow-sm dark:bg-neutral-900 rounded-2xl dark:border-neutral-800">
        {/* === Картинки / видео === */}
        {Array.isArray(post.media) && post.media.length > 0 && (
          <MediaGrid media={post.media} onPreview={setPreview} />
        )}

        {/* === Текст === */}
        <div
          className="leading-relaxed prose-sm prose max-w-none dark:prose-invert text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: visibleHtml }}
        />

        {/* === Кнопка Read more === */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-sm font-medium text-sky-500 hover:text-sky-400"
          >
            {expanded ? "Свернуть ▲" : "Читать дальше ▼"}
          </button>
        )}
        <div className="flex items-center gap-4 mt-3">
          <LikeButton
            postId={post.id}
            user={user}
            likeCount={Number(post.like_count) || 0}
          />

          <DislikeButton
            postId={post.id}
            user={user}
            dislikeCount={Number(post.dislike_count) || 0}
          />
        </div>

        {/* <LikeButton
          postId={post.id}
          user={user}
          likeCount={likeCounts[post.id] ?? post.like_count}
        /> */}

        {/* === Дата === */}
        {date && (
          <div className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Опубликовано: {date}
          </div>
        )}

        {/* === Модалка === */}
        {preview && (
          <ImageModal url={preview} onClose={() => setPreview(null)} />
        )}
      </div>
    </div>
  );
}

function MediaGrid({ media, onPreview }: MediaGridProps) {
  const [, setPreview] = useState<string | null>(null);

  if (!Array.isArray(media) || media.length === 0) return null;

  const handlePreview = (url: string | null) => {
    setPreview(url);
    onPreview?.(url);
  };

  return (
    <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
      {media.map((m, i) => (
        <div
          key={i}
          className="overflow-hidden transition border rounded-lg border-gray-700/40 hover:border-gray-500 dark:border-gray-700/60"
          onClick={() => {
            if (
              m.type === "photo" ||
              m.type === "document" ||
              m.type === "video"
            ) {
              handlePreview(m.url);
            }
          }}
        >
          {/* === Фото === */}
          {m.type === "photo" && (
            <img
              src={m.url}
              alt={`Image ${i + 1}`}
              className="object-cover w-full h-auto rounded-lg cursor-pointer"
              loading="lazy"
            />
          )}

          {/* === Видео === */}
          {m.type === "video" && (
            <video
              controls
              className="w-full h-auto rounded-lg cursor-pointer"
              preload="metadata"
            >
              <source src={m.url} />
            </video>
          )}

          {/* === Документы === */}
          {m.type === "document" && (
            <div className="flex items-center justify-center p-4 text-gray-400 rounded-lg bg-neutral-900">
              <DocumentIcon />
              <span className="ml-2 truncate">{m.file_name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
