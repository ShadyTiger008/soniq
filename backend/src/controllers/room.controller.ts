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
    const { name, description, mood, isPrivate, maxListeners } = req.body;

    if (!name) {
      throw new CustomError("Room name is required", 400);
    }

    if (!req.userId) {
      throw new CustomError("User ID is required", 400);
    }

    const roomData = {
      name,
      description: description || "",
      mood: mood || "Chill",
      isPrivate: isPrivate || false,
      maxListeners: maxListeners || 1000,
      hostId: req.userId,
      listenerCount: 0,
      members: [req.userId] // Host is automatically a member
    };

    const room = await roomService.createRoom(roomData);

    // Populate hostId before sending response
    const populatedRoom = await roomService.getRoomById(String(room._id));

    if (!populatedRoom) {
      throw new CustomError("Failed to retrieve created room", 500);
    }

    // Ensure _id is included as a string in the response
    const roomResponse = populatedRoom.toObject
      ? populatedRoom.toObject()
      : populatedRoom;
    if (roomResponse._id) {
      roomResponse._id = String(roomResponse._id);
    }

    res.status(201).json({
      success: true,
      data: roomResponse
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
      search: search as string
    });

    res.json({
      success: true,
      data: rooms
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

    if (!id) {
      throw new CustomError("Room ID is required", 400);
    }

    const room = await roomService.getRoomById(id);

    if (!room) {
      throw new CustomError(`Room not found with ID: ${id}`, 404);
    }

    // Convert to plain object and ensure _id is a string
    // Since we're using lean(), room is already a plain object
    const roomData = room as any;
    if (roomData._id) {
      roomData._id = String(roomData._id);
    }
    // Also convert nested ObjectIds
    if (
      roomData.hostId &&
      typeof roomData.hostId === "object" &&
      roomData.hostId._id
    ) {
      roomData.hostId._id = String(roomData.hostId._id);
    }
    if (roomData.members && Array.isArray(roomData.members)) {
      roomData.members = roomData.members.map((member: any) => {
        if (member && member._id) {
          member._id = String(member._id);
        }
        return member;
      });
    }

    // Calculate current time for playerState if playing (for mid-way joins)
    if (
      roomData.playerState &&
      roomData.playerState.isPlaying &&
      roomData.playerState.lastUpdated
    ) {
      const timeSinceUpdate =
        (Date.now() - new Date(roomData.playerState.lastUpdated).getTime()) /
        1000;
      roomData.playerState.currentTime = Math.min(
        roomData.playerState.currentTime + timeSinceUpdate,
        roomData.currentSong?.duration ||
          roomData.playerState.currentTime + timeSinceUpdate
      );
    }

    res.json({
      success: true,
      data: roomData
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
      data: room
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
      message: "Room deleted successfully"
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
      data: room
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
    // Only delete room if explicitly requested via query parameter
    const deleteIfHost = req.query.delete === "true";
    await roomService.leaveRoom(id, req.userId!, deleteIfHost);

    res.json({
      success: true,
      message: "Left room successfully"
    });
  } catch (error) {
    next(error);
  }
}
