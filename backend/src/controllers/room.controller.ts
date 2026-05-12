import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { RoomService } from "../services/room.service.js";
import { ApiResponse, asyncHandler } from "../utils/apiResponse.js";
import { BadRequestError, NotFoundError, InternalServerError } from "../utils/errors.js";

const roomService = new RoomService();

/**
 * Creates a new room
 */
export const createRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, mood, isPrivate, maxListeners, cover } = req.body;

  if (!name) {
    throw new BadRequestError("Room name is required");
  }

  if (!req.userId) {
    throw new BadRequestError("User ID is required");
  }

  const roomData = {
    name,
    description: description || "",
    mood: mood || "Chill",
    isPrivate: isPrivate || false,
    maxListeners: maxListeners || 1000,
    cover: cover || "",
    hostId: req.userId,
    listenerCount: 1, // Host is automatically a member
    members: [req.userId]
  };

  const room = await roomService.createRoom(roomData);
  const populatedRoom = await roomService.getRoomById(String(room._id));

  if (!populatedRoom) {
    throw new InternalServerError("Failed to retrieve created room");
  }

  // Ensure _id is included as a string in the response
  const roomResponse = (populatedRoom as any).toObject
    ? (populatedRoom as any).toObject()
    : populatedRoom;
  
  if (roomResponse._id) {
    roomResponse._id = String(roomResponse._id);
  }

  return ApiResponse.created(res, roomResponse, "Room created successfully");
});

/**
 * Lists all rooms with filtering
 */
export const getRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, mood, search } = req.query;
  const rooms = await roomService.getRooms({
    page: Number(page),
    limit: Number(limit),
    mood: mood as string,
    search: search as string,
    sort: req.query.sort as string
  });

  return ApiResponse.success(res, rooms, "Rooms retrieved successfully");
});

/**
 * Gets a single room by ID
 */
export const getRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError("Room ID is required");
  }

  const room = await roomService.getRoomById(id as string);

  if (!room) {
    throw new NotFoundError(`Room not found with ID: ${id}`);
  }

  const roomData = room as any;
  if (roomData._id) roomData._id = String(roomData._id);
  
  if (roomData.hostId) {
    if (typeof roomData.hostId === "object" && roomData.hostId._id) {
       roomData.hostId._id = String(roomData.hostId._id);
    } else if (typeof roomData.hostId !== "object") {
       roomData.hostId = String(roomData.hostId);
    }
  }

  if (roomData.members && Array.isArray(roomData.members)) {
    roomData.members = roomData.members.map((member: any) => {
      if (member && member._id) member._id = String(member._id);
      return member;
    });
  }

  // Calculate current playback time
  if (roomData.playerState?.isPlaying && roomData.playerState?.lastUpdated) {
    const timeSinceUpdate = (Date.now() - new Date(roomData.playerState.lastUpdated).getTime()) / 1000;
    roomData.playerState.currentTime = Math.min(
      roomData.playerState.currentTime + timeSinceUpdate,
      roomData.currentSong?.duration || roomData.playerState.currentTime + timeSinceUpdate
    );
  }

  return ApiResponse.success(res, roomData, "Room details retrieved");
});

/**
 * Updates an existing room
 */
export const updateRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const room = await roomService.updateRoom(id as string, req.userId!, req.body);
  return ApiResponse.success(res, room, "Room updated successfully");
});

/**
 * Deletes a room
 */
export const deleteRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await roomService.deleteRoom(id as string, req.userId!);
  return ApiResponse.success(res, null, "Room deleted successfully");
});

/**
 * Joins a room
 */
export const joinRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const room = await roomService.joinRoom(id as string, req.userId!);
  return ApiResponse.success(res, room, "Joined room successfully");
});

/**
 * Leaves a room
 */
export const leaveRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleteIfHost = req.query.delete === "true";
  await roomService.leaveRoom(id as string, req.userId!, deleteIfHost);
  return ApiResponse.success(res, null, "Left room successfully");
});
