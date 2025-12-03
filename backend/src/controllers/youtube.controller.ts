import { Request, Response, NextFunction } from "express";
import { youtubeService } from "../services/youtube.service.js";
import { CustomError } from "../middleware/errorHandler.js";

export async function searchYouTube(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q || typeof q !== "string") {
      throw new CustomError("Search query is required", 400);
    }

    if (q.trim().length === 0) {
      throw new CustomError("Search query cannot be empty", 400);
    }

    const results = await youtubeService.search(q, Number(maxResults));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

