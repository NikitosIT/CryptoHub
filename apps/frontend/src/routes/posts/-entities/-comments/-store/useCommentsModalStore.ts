import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CommentsModalStore = {
  openPostId: number | null;
  open: (postId: number) => void;
  close: () => void;
};

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
  const openStore = useCommentsModalStore((state) => state.open);
  const close = useCommentsModalStore((state) => state.close);

  const open = () => {
    openStore(postId);
  };

  return {
    isOpen: openPostId === postId,
    open,
    close,
  };
}
