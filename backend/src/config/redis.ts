import Redis from "ioredis";
import { logger } from "../utils/logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("✅ Connected to Redis");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

redisClient.on("close", () => {
  logger.warn("Redis connection closed");
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.ping();
    logger.info("Redis ping successful");
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    throw error;
  }
}

