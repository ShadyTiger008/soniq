import { Router } from "express";
import {
  login,
  signup,
  logout,
  refreshToken
} from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

export const authRoutes = Router();

authRoutes.post("/signup", authRateLimiter, signup);
authRoutes.post("/login", authRateLimiter, login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refreshToken);
