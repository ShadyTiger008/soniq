import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { CustomError } from "../middleware/errorHandler.js";
import { RoomService } from "../services/room.service.js";

const roomService = new RoomService();

export async function createRoom(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roomData = {
      ...req.body,
      hostId: req.userId!,
      host: req.user!,
    };

    const room = await roomService.createRoom(roomData);
    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRooms(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page = 1, limit = 20, mood, search } = req.query;
    const rooms = await roomService.getRooms({
      page: Number(page),
      limit: Number(limit),
      mood: mood as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoom(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const room = await roomService.getRoomById(id);

    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const room = await roomService.updateRoom(id, req.userId!, req.body);

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await roomService.deleteRoom(id, req.userId!);

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function joinRoom(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const room = await roomService.joinRoom(id, req.userId!, req.user!);

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function leaveRoom(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await roomService.leaveRoom(id, req.userId!);

    res.json({
      success: true,
      message: "Left room successfully",
    });
  } catch (error) {
    next(error);
  }
}

