import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";
import { ApiResponse, asyncHandler } from "../utils/apiResponse.js";
import { BadRequestError } from "../utils/errors.js";

const userService = new UserService();

/**
 * Get current user profile
 */
export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.userId!);
  return ApiResponse.success(res, user, "User profile retrieved");
});

/**
 * Update current user profile
 */
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username, email, avatar } = req.body;
  const updateData: any = {};

  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (avatar !== undefined) updateData.avatar = avatar;

  if (Object.keys(updateData).length === 0) {
    throw new BadRequestError("No valid fields to update");
  }

  const user = await userService.updateUser(req.userId!, updateData);
  return ApiResponse.success(res, user, "User profile updated");
});

/**
 * Get rooms hosted by current user
 */
export const getMyRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rooms = await userService.getMyRooms(req.userId!);
  return ApiResponse.success(res, rooms, "My rooms retrieved");
});

/**
 * Get listening history
 */
export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const history = await userService.getHistory(req.userId!);
  return ApiResponse.success(res, history, "Listening history retrieved");
});
