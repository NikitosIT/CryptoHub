import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CommentsModalStore {
  openPostId: number | null;
  open: (postId: number) => void;
  close: () => void;
}

const useCommentsModalStore = create<CommentsModalStore>()(
  persist(
    (set) => ({
      openPostId: null,
      open: (postId) => set({ openPostId: postId }),
      close: () => set({ openPostId: null }),
    }),
    {
      name: 'comments_modal_open',
    },
  ),
);

export function useCommentsModalPersistence(postId: number) {
  const openPostId = useCommentsModalStore((state) => state.openPostId);
  const open = useCommentsModalStore((state) => state.open);
  const close = useCommentsModalStore((state) => state.close);

  return {
    isOpen: openPostId === postId,
    open: () => open(postId),
    close,
  };
}
