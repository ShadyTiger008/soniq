import Redis from "ioredis";
import { logger } from "../utils/logger.js";
import envConfig from "./index.js";

const REDIS_URL = envConfig.redis.url;

// Only initialize Redis if a URL is provided
export const redisClient = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    })
  : null;

if (redisClient) {
  redisClient.on("connect", () => {
    logger.info("✅ Connected to Redis");
  });

  redisClient.on("error", (err) => {
    logger.error("Redis connection error:", err);
  });

  redisClient.on("close", () => {
    logger.warn("Redis connection closed");
  });
} else {
  logger.info("ℹ️ Redis is disabled (REDIS_URL not set)");
}

export async function connectRedis(): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.ping();
    logger.info("Redis ping successful");
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    throw error;
  }
}
