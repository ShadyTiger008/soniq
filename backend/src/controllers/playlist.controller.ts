import { Request, Response } from "express";
import { aiPlaylistService } from "../services/ai-playlist.service.js";
import { ApiResponse, asyncHandler } from "../utils/apiResponse.js";
import { UnauthorizedError, BadRequestError, RateLimitError, InternalServerError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * Controller for AI Playlist operations
 * Uses production-grade ResponseHandler pattern
 */
export class PlaylistController {
  /**
   * Generates a new AI playlist based on user vibe/mood
   */
  generate = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).userId || (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      throw new UnauthorizedError("You must be logged in to generate playlists");
    }

    const { 
      mood, activity, energy, genres, era, language, vibe, length,
      lesserKnown, instrumental, noRepeat, experienceType 
    } = req.body;

    // Validation
    if (!mood && !vibe && !activity) {
      throw new BadRequestError("Please provide at least a mood, activity, or description");
    }

    try {
      const result = await aiPlaylistService.generatePlaylist(userId, {
        mood, activity, energy, genres, era, language, vibe, 
        length: length || 10, 
        lesserKnown, instrumental, noRepeat, experienceType
      });

      return ApiResponse.created(res, result, "Playlist generated successfully");
    } catch (error: any) {
      // Map domain errors to API errors
      if (error.message.includes("GEMINI_RATE_LIMIT") || error.message.includes("429")) {
        throw new RateLimitError("AI service is busy. Please try again in 30 seconds.");
      }
      
      logger.error("PlaylistController: Generation Failure", { error: error.message });
      throw new InternalServerError(error.message);
    }
  });

  /**
   * Get current user's generated playlists
   */
  getMyPlaylists = asyncHandler(async (_req: Request, res: Response) => {
    // Standardized implementation would go here
    return ApiResponse.success(res, [], "Playlists retrieved successfully");
  });
}

export const playlistController = new PlaylistController();
