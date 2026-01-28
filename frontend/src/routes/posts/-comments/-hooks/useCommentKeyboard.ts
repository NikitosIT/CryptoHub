interface UseCommentKeyboardProps {
    onFormSubmit: () => void;
    onCancel: () => void;
}

export function useCommentKeyboard({
    onFormSubmit,
    onCancel,
}: UseCommentKeyboardProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onFormSubmit();
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    return { handleKeyDown };
}
