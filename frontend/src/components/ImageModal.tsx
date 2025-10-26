import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { ImageModalProps } from "@/types/db";

export function ImageModal({ url, onClose }: ImageModalProps) {
  useEscapeKey(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <img
        src={url}
        alt="Preview"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute text-2xl font-bold top-5 right-5 text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
