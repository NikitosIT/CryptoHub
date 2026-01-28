import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/hooks/useToast";
import type { CommentWithReplies } from "@/types/db";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_MEDIA_FILES = 3;
interface UseCommentMediaProps {
  postId: number;
  editingComment: CommentWithReplies | null;
}

const isMediaFile = (file: File) =>
  file.type.startsWith("image/") || file.type.startsWith("video/");

export function useCommentInputMedia({
  postId,
  editingComment,
}: UseCommentMediaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const { showError } = useToast();

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setPreviews([]);
    setExistingMediaUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    if (editingComment) {
      setExistingMediaUrls(editingComment.media?.map((m) => m.url) ?? []);
      setSelectedFiles([]);
    } else {
      clearAll();
    }
  }, [postId, editingComment, clearAll]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      showError(
        `File(s) exceed 5MB: ${oversizedFiles.map((f) => f.name).join(", ")}`,
      );
      return;
    }

    const validFiles = files.filter(isMediaFile);
    if (validFiles.length === 0) return;

    setSelectedFiles((prev) => {
      const currentTotal = prev.length + existingMediaUrls.length;
      const availableSlots = MAX_MEDIA_FILES - currentTotal;

      if (availableSlots <= 0) {
        showError(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
        return prev;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      if (filesToAdd.length < validFiles.length) {
        showError(`Only ${availableSlots} more file(s) can be added`);
      }

      return [...prev, ...filesToAdd];
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    fileInputRef,
    selectedFiles,
    previews,
    existingMediaUrls,
    handleFileSelect,
    removeFile,
    removeExistingMedia,
    clearAll,
  };
}
