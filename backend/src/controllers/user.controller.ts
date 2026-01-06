import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";
import { CustomError } from "../middleware/errorHandler.js";

const userService = new UserService();

export async function getUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.getUserById(req.userId!);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, avatar } = req.body;
    const updateData: any = {};

    // Only allow updating specific fields
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      throw new CustomError("No valid fields to update", 400);
    }

    const user = await userService.updateUser(req.userId!, updateData);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyRooms(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rooms = await userService.getMyRooms(req.userId!);
    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const history = await userService.getHistory(req.userId!);
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

