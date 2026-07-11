import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  PostFavorite,
  TelegramPost,
} from "../../../../prisma/generated/prisma/client.js";
import { API_ROUTES } from "@/constants/routes.js";
import { errorHandler } from "@/middleware/errorHandler.js";

type FavoriteTransactionClient = {
  postFavorite: {
    findUnique: typeof findUniqueMock;
    create: typeof createMock;
    delete: typeof deleteMock;
  };
  telegramPost: {
    update: typeof updateMock;
  };
};

type FavoriteTransactionCallback<T> = (
  tx: FavoriteTransactionClient,
) => Promise<T>;

const { transactionMock, findUniqueMock, createMock, deleteMock, updateMock } =
  vi.hoisted(() => ({
    transactionMock: vi.fn(),
    findUniqueMock: vi.fn(),
    createMock: vi.fn(),
    deleteMock: vi.fn(),
    updateMock: vi.fn(),
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

import favoritesRouter from "./favorites.route.js";

const app = express();

app.use(express.json());
app.use(API_ROUTES.favorites, favoritesRouter);
app.use(errorHandler);

describe("POST /api/posts/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    findUniqueMock.mockReset();
    createMock.mockReset();
    deleteMock.mockReset();
    updateMock.mockReset();

    transactionMock.mockImplementation(
      async <T>(callback: FavoriteTransactionCallback<T>): Promise<T> => {
        const tx: FavoriteTransactionClient = {
          postFavorite: {
            findUnique: findUniqueMock,
            create: createMock,
            delete: deleteMock,
          },
          telegramPost: {
            update: updateMock,
          },
        };

        return callback(tx);
      },
    );
  });

  it("adds a post to favorites and increments favoritesCount", async () => {
    findUniqueMock.mockResolvedValue(null);
    createMock.mockResolvedValue({
      id: 1,
      userId: "user-1",
      postId: 42,
    } satisfies Pick<PostFavorite, "id" | "userId" | "postId">);
    updateMock.mockResolvedValue({
      favoritesCount: 3,
    } satisfies Pick<TelegramPost, "favoritesCount">);

    const response = await request(app)
      .post(API_ROUTES.favorites)
      .send({ postId: 42 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      isFavorite: true,
      favoritesCount: 3,
    });
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        userId_postId: {
          userId: "user-1",
          postId: 42,
        },
      },
    });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        postId: 42,
      },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        favoritesCount: {
          increment: 1,
        },
      },
      select: {
        favoritesCount: true,
      },
    });
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("removes a post from favorites and decrements favoritesCount", async () => {
    findUniqueMock.mockResolvedValue({
      id: 1,
      userId: "user-1",
      postId: 42,
    } satisfies Pick<PostFavorite, "id" | "userId" | "postId">);
    deleteMock.mockResolvedValue({
      id: 1,
    });
    updateMock.mockResolvedValue({
      favoritesCount: 2,
    } satisfies Pick<TelegramPost, "favoritesCount">);

    const response = await request(app)
      .post(API_ROUTES.favorites)
      .send({ postId: 42 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      isFavorite: false,
      favoritesCount: 2,
    });
    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        userId_postId: {
          userId: "user-1",
          postId: 42,
        },
      },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        favoritesCount: {
          decrement: 1,
        },
      },
      select: {
        favoritesCount: true,
      },
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { postId: "42" },
    { postId: 0 },
    { postId: -1 },
    { postId: 1.5 },
  ])("rejects invalid body: %j", async (body) => {
    const response = await request(app).post(API_ROUTES.favorites).send(body);

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
