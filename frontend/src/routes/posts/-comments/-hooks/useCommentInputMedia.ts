import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MAX_FILE_SIZE, MAX_MEDIA_FILES } from '@/constants/comments';
import { useToast } from '@/hooks/useToast';

import { useCommentContext } from '../-components/comments-context';
import { buildMediaItems } from '../-utils/commentMediaUtils';

const isMediaFile = (file: File) =>
  file.type.startsWith('image/') || file.type.startsWith('video/');

export function useCommentInputMedia() {
  const { postId, editingComment } = useCommentContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const { showError } = useToast();

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setPreviews([]);
    setExistingMediaUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (fileInputRef.current) fileInputRef.current.value = '';

    const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      showError(`File(s) exceed 5MB: ${oversizedFiles.map((f) => f.name).join(', ')}`);
      return;
    }

    const validFiles = files.filter(isMediaFile);
    if (validFiles.length === 0) return;

    setSelectedFiles((prev) => {
      const available = MAX_MEDIA_FILES - prev.length - existingMediaUrls.length;

      if (available <= 0) {
        showError(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
        return prev;
      }

      const filesToAdd = validFiles.slice(0, available);
      if (filesToAdd.length < validFiles.length) {
        showError(`Only ${available} more file(s) can be added`);
      }

      return [...prev, ...filesToAdd];
    });
  };

  const allMediaItems = useMemo(
    () => buildMediaItems(editingComment, selectedFiles, previews, existingMediaUrls),
    [editingComment, selectedFiles, previews, existingMediaUrls],
  );

  const handleMediaRemove = (item: (typeof allMediaItems)[number]) => {
    if (item.isExisting) {
      setExistingMediaUrls((prev) => prev.filter((url) => url !== item.url));
    } else {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== item.index));
    }
  };

  return {
    fileInputRef,
    selectedFiles,
    existingMediaUrls,
    handleFileSelect,
    clearAll,
    allMediaItems,
    handleMediaRemove,
  };
}
