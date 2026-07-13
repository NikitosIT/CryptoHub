import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes.js";
import { errorHandler } from "@/middleware/errorHandler.js";

import type {
  PostReaction,
  TelegramPost,
} from "../../../../prisma/generated/prisma/client.js";

type ReactionTransactionClient = {
  telegramPost: {
    findUnique: typeof findPostMock;
    update: typeof updatePostMock;
  };
  postReaction: {
    findUnique: typeof findReactionMock;
    create: typeof createReactionMock;
    update: typeof updateReactionMock;
    delete: typeof deleteReactionMock;
  };
};

type ReactionTransactionCallback<T> = (
  tx: ReactionTransactionClient,
) => Promise<T>;

const {
  transactionMock,
  findPostMock,
  updatePostMock,
  findReactionMock,
  createReactionMock,
  updateReactionMock,
  deleteReactionMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  findPostMock: vi.fn(),
  updatePostMock: vi.fn(),
  findReactionMock: vi.fn(),
  createReactionMock: vi.fn(),
  updateReactionMock: vi.fn(),
  deleteReactionMock: vi.fn(),
}));

vi.mock("@/libs/db.js", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

vi.mock("@/middleware/requireAuth.js", () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    Object.assign(req, {
      user: {
        id: "user-1",
      },
    });

    next();
  },
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

import reactionsRouter from "./reactions.route.js";

const app = express();

app.use(express.json());
app.use(API_ROUTES.posts, reactionsRouter);
app.use(errorHandler);

describe("POST /api/posts/:postId/reactions", () => {
  const validReactionRoute = API_ROUTES.reactions.replace(":postId", "42");

  beforeEach(() => {
    vi.clearAllMocks();

    transactionMock.mockImplementation(
      async <T>(callback: ReactionTransactionCallback<T>): Promise<T> => {
        const tx: ReactionTransactionClient = {
          telegramPost: {
            findUnique: findPostMock,
            update: updatePostMock,
          },
          postReaction: {
            findUnique: findReactionMock,
            create: createReactionMock,
            update: updateReactionMock,
            delete: deleteReactionMock,
          },
        };

        return callback(tx);
      },
    );
  });

  it("adds a like reaction when the user has no reaction yet", async () => {
    findPostMock.mockResolvedValue({ id: 42 });
    findReactionMock.mockResolvedValue(null);
    createReactionMock.mockResolvedValue({
      id: 1,
      userId: "user-1",
      postId: 42,
      reactionType: "LIKE",
    } satisfies Pick<
      PostReaction,
      "id" | "userId" | "postId" | "reactionType"
    >);
    updatePostMock.mockResolvedValue({
      likeCount: 5,
      dislikeCount: 1,
    } satisfies Pick<TelegramPost, "likeCount" | "dislikeCount">);

    const response = await request(app)
      .post(validReactionRoute)
      .send({ reactionType: "LIKE" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      postId: 42,
      status: "liked",
      likeCount: 5,
      dislikeCount: 1,
    });
    expect(createReactionMock).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        postId: 42,
        reactionType: "LIKE",
      },
    });
  });

  it("removes the reaction when the same reaction is sent twice", async () => {
    findPostMock.mockResolvedValue({ id: 42 });
    findReactionMock.mockResolvedValue({
      id: 1,
      userId: "user-1",
      postId: 42,
      reactionType: "LIKE",
    } satisfies Pick<
      PostReaction,
      "id" | "userId" | "postId" | "reactionType"
    >);
    deleteReactionMock.mockResolvedValue({ id: 1 });
    updatePostMock.mockResolvedValue({
      likeCount: 4,
      dislikeCount: 1,
    } satisfies Pick<TelegramPost, "likeCount" | "dislikeCount">);

    const response = await request(app)
      .post(validReactionRoute)
      .send({ reactionType: "LIKE" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      postId: 42,
      status: null,
      likeCount: 4,
      dislikeCount: 1,
    });
    expect(deleteReactionMock).toHaveBeenCalledWith({
      where: {
        userId_postId: {
          userId: "user-1",
          postId: 42,
        },
      },
    });
  });

  it("switches like to dislike and updates both counters", async () => {
    findPostMock.mockResolvedValue({ id: 42 });
    findReactionMock.mockResolvedValue({
      id: 1,
      userId: "user-1",
      postId: 42,
      reactionType: "LIKE",
    } satisfies Pick<
      PostReaction,
      "id" | "userId" | "postId" | "reactionType"
    >);
    updateReactionMock.mockResolvedValue({
      id: 1,
      reactionType: "DISLIKE",
    });
    updatePostMock.mockResolvedValue({
      likeCount: 4,
      dislikeCount: 2,
    } satisfies Pick<TelegramPost, "likeCount" | "dislikeCount">);

    const response = await request(app)
      .post(validReactionRoute)
      .send({ reactionType: "DISLIKE" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      postId: 42,
      status: "disliked",
      likeCount: 4,
      dislikeCount: 2,
    });
    expect(updateReactionMock).toHaveBeenCalledWith({
      where: {
        userId_postId: {
          userId: "user-1",
          postId: 42,
        },
      },
      data: {
        reactionType: "DISLIKE",
      },
    });
    expect(updatePostMock).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        likeCount: { decrement: 1 },
        dislikeCount: { increment: 1 },
      },
      select: {
        likeCount: true,
        dislikeCount: true,
      },
    });
  });

  it("returns 404 when the post does not exist", async () => {
    findPostMock.mockResolvedValue(null);

    const response = await request(app)
      .post(validReactionRoute)
      .send({ reactionType: "LIKE" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "error",
      message: "Post not found",
    });
    expect(findReactionMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      url: API_ROUTES.reactions.replace(":postId", "abc"),
      body: { reactionType: "LIKE" },
    },
    {
      url: API_ROUTES.reactions.replace(":postId", "0"),
      body: { reactionType: "LIKE" },
    },
    { url: validReactionRoute, body: {} },
    { url: validReactionRoute, body: { reactionType: "LOVE" } },
  ])("rejects invalid request: %j", async ({ url, body }) => {
    const response = await request(app).post(url).send(body);

    const responseBody = response.body as {
      issues: unknown[];
      message: string;
      status: string;
    };

    expect(response.status).toBe(400);
    expect(responseBody.status).toBe("error");
    expect(responseBody.message).toBe("Validation error");
    expect(responseBody.issues).toBeInstanceOf(Array);
    expect(transactionMock).not.toHaveBeenCalled();
  });
});
