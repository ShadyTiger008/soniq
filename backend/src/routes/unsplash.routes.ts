import { Router } from "express";
import { searchPhotos } from "../controllers/unsplash.controller.js";
import { authenticate } from "../middleware/auth.js";

export const unsplashRoutes = Router();

// Search photos (protected)
unsplashRoutes.get("/search", authenticate, searchPhotos);
