import { useEffect, useState } from "react";

const STORAGE_KEY = "comments_modal_open";

export function useCommentsModalPersistence(postId: number) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as { postId: number };

      if (parsed.postId === postId) {
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Failed to load modal state:", err);
    }
  }, [postId]);

  const open = () => {
    setIsOpen(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ postId }));
    } catch {
      // Ignore errors during localStorage set
    }
  };

  const close = () => {
    setIsOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors during localStorage remove
    }
  };

  return { isOpen, open, close };
}
