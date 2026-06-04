import { logger } from "@/libs/logger.js";
import { appRedis } from "@/libs/redis.js";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await appRedis.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ err: error, key }, "Failed to read cache");
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await appRedis.set(key, JSON.stringify(value), {
        expiration: {
          type: "EX",
          value: ttlSeconds,
        },
      });
    } catch (error) {
      logger.error({ err: error, key }, "Failed to write cache");
    }
  },
};
