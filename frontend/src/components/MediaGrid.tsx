import { useState } from "react";
import type { MediaGridProps } from "@/types/db";
import { DocumentIcon } from "./DocumentIcon";

export default function MediaGrid({ media, onPreview }: MediaGridProps) {
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
