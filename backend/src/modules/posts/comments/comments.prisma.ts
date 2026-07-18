import type { Prisma } from "prisma/generated/prisma/client.js";

export const commentSelect = {
  id: true,
  postId: true,
  parentCommentId: true,
  text: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,

  media: {
    orderBy: { id: "asc" as const },
    select: {
      type: true,
      url: true,
      mimeType: true,
      size: true,
      width: true,
      height: true,
    },
  },
} satisfies Prisma.PostCommentSelect;

export type CommentResponse = Prisma.PostCommentGetPayload<{
  select: typeof commentSelect;
}>;
