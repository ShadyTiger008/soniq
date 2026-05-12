import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// userId:date -> count
const userGenerationCount = new Map<string, number>();

/**
 * Rate limiter for AI Playlist Generation.
 * Free users: 2 per day
 * Premium users: 20 per day
 */
export function playlistRateLimit(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = user._id || user.id;
  const today = new Date().toDateString();
  const key = `${userId}:${today}`;

  const count = userGenerationCount.get(key) || 0;
  
  // Assuming user object has isPremium property
  // If not, we can default to 2 for everyone or check from DB
  const limit = user.isPremium ? 20 : 2;

  if (count >= limit) {
    logger.warn(`Rate limit reached for user ${userId}: ${count}/${limit}`);
    return res.status(429).json({
      error: "Daily generation limit reached",
      message: "You've reached your daily limit for AI playlist generation.",
      upgradePrompt: !user.isPremium,
      limit,
      remaining: 0
    });
  }

  // Increment count
  userGenerationCount.set(key, count + 1);
  
  // Clean up old entries occasionally (simple cleanup)
  if (userGenerationCount.size > 10000) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    for (const [k] of userGenerationCount) {
      if (k.includes(yesterdayStr)) {
        userGenerationCount.delete(k);
      }
    }
  }

  return next();
}
