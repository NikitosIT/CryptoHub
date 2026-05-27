import { prisma } from "@/libs/db.js";
import { appRedis } from "@/redis/redis.js";

import type {
  HealthDependencyStatus,
  HealthResponse,
} from "./health.schema.js";

const checkDatabase = async (): Promise<HealthDependencyStatus> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
};

const checkRedis = async (): Promise<HealthDependencyStatus> => {
  try {
    await appRedis.ping();
    return "ok";
  } catch {
    return "error";
  }
};

const getHealth = async (): Promise<HealthResponse> => {
  const [database, redisStatus] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const allOk = database === "ok" && redisStatus === "ok";

  return {
    status: allOk ? "healthy" : "unhealthy",
    checks: {
      database,
      redis: redisStatus,
    },
  };
};

export const healthService = {
  getHealth,
} as const;
