import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponse, asyncHandler } from "../utils/apiResponse.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";

const authService = new AuthService();

/**
 * Register a new user
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    throw new BadRequestError("Email, password, and username are required");
  }

  const user = await authService.signup(email, password, username);
  return ApiResponse.created(res, user, "User registered successfully");
});

/**
 * Log in a user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const result = await authService.login(email, password);

  // Set auth token in cookie
  res.cookie("authToken", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return ApiResponse.success(res, result, "Logged in successfully");
});

/**
 * Log in with Google
 */
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new BadRequestError("Google ID token is required");
  }

  const result = await authService.googleLogin(idToken);

  // Set auth token in cookie
  res.cookie("authToken", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return ApiResponse.success(res, result, "Logged in with Google successfully");
});

/**
 * Log out a user
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("authToken");
  return ApiResponse.success(res, null, "Logged out successfully");
});

/**
 * Refresh authentication token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.authToken || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("Authentication token required");
  }

  const newToken = await authService.refreshToken(token);

  res.cookie("authToken", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, { token: newToken }, "Token refreshed successfully");
});
