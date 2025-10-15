import DOMPurify from "dompurify";
import { toHTML } from "@telegraf/entity";
import { normalizeEntities } from "@/utils/normalize";
import type { TelegramPost } from "@/types/db";
import type { MessageEntity } from "@telegraf/entity/types/types";
import { useMemo, useState } from "react";
import { ImageModal } from "./ImageModal";

export function TelegramCaption({ post }: { post: TelegramPost }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const caption = post.text_caption ?? "";
  const entities: MessageEntity[] = normalizeEntities(post.text_entities);
  const rawHtml = toHTML({ text: caption, entities });

  // Санитизация
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });

  const finalHtml = useMemo(() => {
    const doc = new DOMParser().parseFromString(safeHtml, "text/html");
    doc.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer nofollow ugc");
      a.classList.add(
        "no-underline",
        "text-sky-400",
        "hover:underline",
        "hover:text-sky-600"
      );
    });
    return doc.body.innerHTML;
  }, [safeHtml]);

  // Формат даты
  const date = post.created_at
    ? new Date(post.created_at).toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const MAX_LENGTH = 1000;
  const isLong = caption.length > MAX_LENGTH;
  const visibleHtml =
    isLong && !expanded ? safeHtml.slice(0, MAX_LENGTH) + "..." : finalHtml;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 p-5 mb-6 transition-all">
        {/* === Картинки / видео === */}
        {Array.isArray(post.media) && post.media.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {post.media.map((m, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-300 dark:border-neutral-700 hover:opacity-90 transition cursor-pointer"
                onClick={() => m.type === "photo" && setPreview(m.url)}
              >
                {m.type === "photo" ? (
                  <img
                    src={m.url}
                    alt={`Telegram image ${i + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                ) : m.type === "video" ? (
                  <video controls className="w-full h-auto rounded-lg">
                    <source src={m.url} />
                  </video>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* === Текст === */}
        <div
          className="prose prose-sm max-w-none dark:prose-invert
          
             text-neutral-700 dark:text-neutral-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: visibleHtml }}
        />

        {/* === Кнопка Read more === */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sky-500 hover:text-sky-400 text-sm font-medium mt-1"
          >
            {expanded ? "Свернуть ▲" : "Читать дальше ▼"}
          </button>
        )}

        {/* === Дата === */}
        {date && (
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
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
