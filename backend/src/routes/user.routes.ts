import { Router } from "express";
import { getUser, updateUser, getMyRooms, getHistory } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

export const userRoutes = Router();

// Get current user profile
userRoutes.get("/me", authenticate, getUser);
// Update current user profile
userRoutes.put("/me", authenticate, updateUser);

// Get user's rooms
userRoutes.get("/me/rooms", authenticate, getMyRooms);

// Get listen history
userRoutes.get("/me/history", authenticate, getHistory);
