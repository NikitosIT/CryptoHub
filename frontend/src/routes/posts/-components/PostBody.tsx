import { memo, useMemo, useState } from 'react';
import { toHTML } from '@telegraf/entity';
import type { MessageEntity } from '@telegraf/entity/types/types';

import { TG_MEDIA_BUCKET } from '@/constants/storage';
import { resolvePublicStorageUrl } from '@/utils/storage';

import { formatRelativeTime } from '../../../utils/formatDate';
import { CommentOpenButton } from '../-entities/-comments/-components/CommentOpenButton';
import FavoriteButton from '../-entities/-reactions/-components/FavoriteButton';
import { ReactionButton } from '../-entities/-reactions/-components/ReactionButton';
import type { TelegramPost } from '../-types/post-types';
import { processLinks } from '../-utils/processLinks';
import { sanitizeHtml } from '../-utils/sanitizeHtml';
import { DocumentIcon } from './DocumentIcon';
import { ImageModal } from './ImageModal';
type MediaGridProps = {
  media: TelegramPost['media'];
  onPreview?: (url: string | null) => void;
};

export function PostBody({ post }: { post: TelegramPost }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const caption = post.text_caption ?? '';

  const finalHtml = useMemo(() => {
    const entities: MessageEntity[] = post.text_entities ?? [];
    const rawHtml = toHTML({ text: caption, entities });
    const safeHtml = sanitizeHtml(rawHtml);
    return processLinks(safeHtml);
  }, [caption, post.text_entities]);

  const date = formatRelativeTime(post.created_at);
  const MAX_LENGTH = 1000;
  const isLong = caption.length > MAX_LENGTH;
  const visibleHtml =
    isLong && !expanded ? finalHtml.slice(0, MAX_LENGTH) + '...' : finalHtml;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl p-3 transition-all bg-white border border-gray-200 shadow-sm sm:p-4 md:p-5 dark:bg-neutral-900 rounded-xl sm:rounded-2xl dark:border-neutral-800">
        {Array.isArray(post.media) && post.media.length > 0 && (
          <MediaGrid media={post.media} onPreview={setPreview} />
        )}

        <div
          className="leading-relaxed prose-sm prose sm:prose-base font-inter max-w-none dark:prose-invert text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: visibleHtml }}
        />

        {isLong ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs font-medium cursor-pointer sm:text-sm text-sky-500 hover:text-sky-400"
          >
            {expanded ? 'Hide ... ' : 'Read more ... '}
          </button>
        ) : null}

        <div className="flex items-center justify-between px-1 mt-2 sm:mt-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <ReactionButton post={post} />
            <CommentOpenButton post={post} />
          </div>

          <div className="flex items-center">
            <FavoriteButton post={post} />
          </div>
        </div>

        {date ? (
          <div className="mt-2 text-xs sm:mt-3 sm:text-sm text-neutral-500 dark:text-neutral-400">
            Published: {date}
          </div>
        ) : null}

        {preview ? <ImageModal url={preview} onClose={() => setPreview(null)} /> : null}
      </div>
    </div>
  );
}

const MediaGrid = memo(function MediaGrid({ media, onPreview }: MediaGridProps) {
  if (!Array.isArray(media) || media.length === 0) return null;

  const handlePreview = (url: string | null) => {
    onPreview?.(url);
  };

  return (
    <div className="grid grid-cols-1 gap-2 mb-2 sm:gap-3 sm:mb-3 sm:grid-cols-2">
      {media.map((m, i) => {
        const mediaUrl = resolvePublicStorageUrl(m.url, TG_MEDIA_BUCKET);

        return (
          <div
            key={i}
            className="overflow-hidden transition border rounded-lg border-gray-700/40 hover:border-gray-500 dark:border-gray-700/60"
            style={{
              aspectRatio: m.type === 'photo' || m.type === 'video' ? '4 / 3' : undefined,
            }}
            onClick={() => {
              if (m.type === 'photo' || m.type === 'document' || m.type === 'video') {
                handlePreview(mediaUrl);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (m.type === 'photo' || m.type === 'document' || m.type === 'video') {
                  handlePreview(mediaUrl);
                }
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open ${m.type} preview`}
          >
            {m.type === 'photo' && (
              <img
                src={mediaUrl}
                alt={`Image ${i + 1}`}
                className="object-cover w-full h-full rounded-lg cursor-pointer"
                loading="lazy"
              />
            )}

            {m.type === 'video' && (
              <video
                controls
                className="object-cover w-full h-full rounded-lg cursor-pointer"
                preload="metadata"
              >
                <source src={mediaUrl} />
              </video>
            )}

            {m.type === 'document' && (
              <div className="flex items-center justify-center p-4 text-gray-400 rounded-lg bg-neutral-900">
                <DocumentIcon />
                <span className="ml-2 truncate">{m.file_name}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
