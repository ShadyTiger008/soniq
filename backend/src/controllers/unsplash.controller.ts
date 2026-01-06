import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { UnsplashService } from "../services/unsplash.service.js";

const unsplashService = new UnsplashService();

export async function searchPhotos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query, page = 1, perPage = 20 } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ success: false, message: "Query parameter is required" });
      return;
    }

    const data = await unsplashService.searchPhotos(
      query,
      Number(page),
      Number(perPage)
    );

    res.json({
      success: true,
      data: data.results,
      meta: {
        total: data.total,
        totalPages: data.total_pages
      }
    });
  } catch (error) {
    next(error);
  }
}
