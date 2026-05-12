import { Request, Response } from "express";
import { youtubeService } from "../services/youtube.service.js";
import { ApiResponse, asyncHandler } from "../utils/apiResponse.js";
import { BadRequestError } from "../utils/errors.js";

/**
 * Search YouTube for music videos
 */
export const searchYouTube = asyncHandler(async (req: Request, res: Response) => {
  const { q, maxResults = 10 } = req.query;

  if (!q || typeof q !== "string" || q.trim().length === 0) {
    throw new BadRequestError("A valid search query is required");
  }

  const results = await youtubeService.search(q, Number(maxResults));
  return ApiResponse.success(res, results, "YouTube search results retrieved");
});
