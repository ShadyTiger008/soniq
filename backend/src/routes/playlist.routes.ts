import { Router } from "express";
import { playlistController } from "../controllers/playlist.controller.js";
import { authenticate } from "../middleware/auth.js";
import { playlistRateLimit } from "../middleware/playlistRateLimiter.js";

const playlistRoutes = Router();

// POST /api/playlist/generate
playlistRoutes.post("/generate", authenticate as any, playlistRateLimit as any, playlistController.generate);

// GET /api/playlist/me
playlistRoutes.get("/me", authenticate as any, playlistController.getMyPlaylists);

export { playlistRoutes };
