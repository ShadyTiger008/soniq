import { Router } from "express";
import { searchYouTube } from "../controllers/youtube.controller.js";
import { authenticate } from "../middleware/auth.js";

export const youtubeRoutes = Router();

// Search YouTube videos
youtubeRoutes.get("/search", authenticate, searchYouTube);

