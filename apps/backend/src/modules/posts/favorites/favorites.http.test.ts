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
  PostFavorite,
  TelegramPost,
} from "../../../../prisma/generated/prisma/client.js";

type FavoriteTransactionClient = {
  telegramPost: {
    findUnique: typeof findPostMock;
    update: typeof updateMock;
  };
  postFavorite: {
    findUnique: typeof findUniqueMock;
    create: typeof createMock;
    delete: typeof deleteMock;
  };
};

type FavoriteTransactionCallback<T> = (
  tx: FavoriteTransactionClient,
) => Promise<T>;

const {
  transactionMock,
  findPostMock,
  findUniqueMock,
  createMock,
  deleteMock,
  updateMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  findPostMock: vi.fn(),
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
app.use(API_ROUTES.posts, favoritesRouter);
app.use(errorHandler);

describe("POST /api/posts/:postId/favorites", () => {
  const validFavoriteRoute = API_ROUTES.favorites.replace(":postId", "42");

  beforeEach(() => {
    vi.clearAllMocks();

    findPostMock.mockReset();
    findUniqueMock.mockReset();
    createMock.mockReset();
    deleteMock.mockReset();
    updateMock.mockReset();

    transactionMock.mockImplementation(
      async <T>(callback: FavoriteTransactionCallback<T>): Promise<T> => {
        const tx: FavoriteTransactionClient = {
          telegramPost: {
            findUnique: findPostMock,
            update: updateMock,
          },
          postFavorite: {
            findUnique: findUniqueMock,
            create: createMock,
            delete: deleteMock,
          },
        };

        return callback(tx);
      },
    );
  });

  it("adds a post to favorites and increments favoritesCount", async () => {
    findPostMock.mockResolvedValue({ id: 42 });
    findUniqueMock.mockResolvedValue(null);
    createMock.mockResolvedValue({
      id: 1,
      userId: "user-1",
      postId: 42,
    } satisfies Pick<PostFavorite, "id" | "userId" | "postId">);
    updateMock.mockResolvedValue({
      favoritesCount: 3,
    } satisfies Pick<TelegramPost, "favoritesCount">);

    const response = await request(app).post(validFavoriteRoute);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      isFavorite: true,
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
    });
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("removes a post from favorites and decrements favoritesCount", async () => {
    findPostMock.mockResolvedValue({ id: 42 });
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

    const response = await request(app).post(validFavoriteRoute);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      isFavorite: false,
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
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it.each([
    API_ROUTES.favorites.replace(":postId", "abc"),
    API_ROUTES.favorites.replace(":postId", "0"),
    API_ROUTES.favorites.replace(":postId", "-1"),
    API_ROUTES.favorites.replace(":postId", "1.5"),
  ])("rejects invalid params: %s", async (url) => {
    const response = await request(app).post(url);

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
