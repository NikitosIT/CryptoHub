import { toHTML } from "@telegraf/entity";
import { normalizeEntities } from "@/utils/normalizeEntities";
import type { TelegramPost } from "@/types/db";
import type { MessageEntity } from "@telegraf/entity/types/types";
import { useMemo, useState } from "react";
import { ImageModal } from "./ImageModal";
import { formatDate } from "@/utils/formatDate";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { processLinks } from "@/utils/processLinks";
import MediaGrid from "./MediaGrid";

export function TelegramCaption({ post }: { post: TelegramPost }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const caption = post.text_caption ?? "";
  const entities: MessageEntity[] = normalizeEntities(post.text_entities);
  const rawHtml = toHTML({ text: caption, entities });

  const safeHtml = sanitizeHtml(rawHtml);
  const finalHtml = useMemo(() => processLinks(safeHtml), [safeHtml]);

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
