import { Router } from "express";
import { getUser, updateUser } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

export const userRoutes = Router();

// Get current user profile
userRoutes.get("/me", authenticate, getUser);
// Update current user profile
userRoutes.put("/me", authenticate, updateUser);
