type UseCommentKeyboardProps = {
  onFormSubmit: () => void;
};

export function useCommentKeyboard({ onFormSubmit }: UseCommentKeyboardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onFormSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
    }
  };

  return { handleKeyDown };
}
