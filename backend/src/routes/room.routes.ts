import { Router } from "express";
import {
  createRoom,
  getRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom
} from "../controllers/room.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

export const roomRoutes = Router();

// Public routes
roomRoutes.get("/", optionalAuth, getRooms);
roomRoutes.get("/:id", optionalAuth, getRoom);

// Protected routes
roomRoutes.post("/", authenticate, createRoom);
roomRoutes.put("/:id", authenticate, updateRoom);
roomRoutes.delete("/:id", authenticate, deleteRoom);
roomRoutes.post("/:id/join", authenticate, joinRoom);
roomRoutes.post("/:id/leave", authenticate, leaveRoom);
