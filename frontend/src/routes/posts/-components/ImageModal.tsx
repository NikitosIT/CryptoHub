import { RemoveScroll } from "react-remove-scroll";

import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { ImageModalProps } from "@/types/db";

export function ImageModal({ url, onClose }: ImageModalProps) {
  useEscapeKey(onClose);

  return (
    <RemoveScroll>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md sm:backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close preview"
      >
        <img
          src={url}
          alt="Preview"
          className="max-w-[85vw] max-h-[75vh] sm:max-w-[90vw] sm:max-h-[90vh] object-contain rounded-lg sm:rounded-2xl shadow-2xl relative z-10"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          role="button"
          tabIndex={0}
        />
        <button
          onClick={onClose}
          className="absolute z-20 flex items-center justify-center w-10 h-10 text-2xl font-bold text-white border-2 rounded-full sm:text-3xl top-4 right-4 sm:top-6 sm:right-6 hover:text-white/80 active:text-white/80 sm:w-12 sm:h-12 bg-black/60 sm:bg-black/40 backdrop-blur-sm border-white/20 sm:border-white/10"
          aria-label="Close preview"
        >
          ✕
        </button>
      </div>
    </RemoveScroll>
  );
}
