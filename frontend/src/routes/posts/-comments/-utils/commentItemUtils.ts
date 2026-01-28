import type { CommentWithReplies } from "@/types/db";
import { getPublicAvatarUrl } from "@/utils/storage";

export function getCommentAvatarUrl(
    comment: CommentWithReplies,
): string | null {
    const avatarUuid = comment.user?.raw_user_meta_data?.avatar_url;
    return avatarUuid ? getPublicAvatarUrl(avatarUuid) : null;
}

export function getCommentUserName(comment: CommentWithReplies | null): string {
    if (!comment) return "User";
    const nickname = comment.user?.raw_user_meta_data?.nickname?.trim();
    return nickname || "User";
}

export function isCommentOwner(
    comment: CommentWithReplies,
    currentUserId: string | undefined,
): boolean {
    return !!currentUserId && currentUserId === comment.user_id;
}
