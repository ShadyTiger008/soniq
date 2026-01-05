import { RoomModel } from "../models/room.model.js";
import { CustomError } from "../middleware/errorHandler.js";
import mongoose from "mongoose";

export class RoomService {
  async createRoom(roomData: any) {
    try {
      // Ensure hostId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(roomData.hostId)) {
        throw new CustomError("Invalid host ID", 400);
      }

      // Convert hostId to ObjectId if it's a string
      if (typeof roomData.hostId === "string") {
        roomData.hostId = new mongoose.Types.ObjectId(roomData.hostId);
      }

      // Convert members array to ObjectIds
      if (roomData.members && Array.isArray(roomData.members)) {
        roomData.members = roomData.members.map((id: string) =>
          typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
        );
      }

      const room = new RoomModel(roomData);
      const savedRoom = await room.save();
      return savedRoom;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw new CustomError(
          Object.values(error.errors)
            .map((e: any) => e.message)
            .join(", "),
          400
        );
      }
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new CustomError("Room with this name already exists", 400);
      }
      throw error;
    }
  }

  async getRooms(filters: {
    page: number;
    limit: number;
    mood?: string;
    search?: string;
    sort?: string;
  }) {
    const query: any = {};

    if (filters.mood) {
      query.mood = filters.mood;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } }
      ];
    }

    const rooms = await RoomModel.find(query)
      .populate("hostId", "username email avatar")
      .limit(filters.limit)
      .skip((filters.page - 1) * filters.limit)
      .sort(filters.sort === 'trending' ? { listenerCount: -1 } : { createdAt: -1 });

    const total = await RoomModel.countDocuments(query);

    return {
      rooms,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  async getRoomById(id: string) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid room ID format", 400);
    }

    try {
      // Convert string to ObjectId for query
      const objectId = new mongoose.Types.ObjectId(id);

      const room = await RoomModel.findById(objectId)
        .populate("hostId", "username email avatar")
        .populate("members", "username email avatar")
        .populate("queue.requestedBy", "username email")
        .lean(); // Use lean() for better performance and to avoid Mongoose document issues

      if (process.env.NODE_ENV === "development" && !room) {
        console.log(`Room not found with ID: ${id}, ObjectId: ${objectId}`);
        // Try without populate to see if room exists
        const roomWithoutPopulate = await RoomModel.findById(objectId).lean();
        console.log(
          "Room without populate:",
          roomWithoutPopulate ? "Found" : "Not found"
        );
      }

      return room;
    } catch (error: any) {
      if (error.name === "CastError") {
        throw new CustomError("Invalid room ID format", 400);
      }
      throw error;
    }
  }

  async updateRoom(id: string, userId: string, updateData: any) {
    const room = await RoomModel.findById(id);

    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    if (room.hostId.toString() !== userId) {
      throw new CustomError("Unauthorized", 403);
    }

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "description",
      "mood",
      "isPrivate",
      "maxListeners"
    ];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // If privacy changed, handle invite code
    if (
      filteredData.isPrivate !== undefined &&
      filteredData.isPrivate !== room.isPrivate
    ) {
      if (!filteredData.isPrivate) {
        filteredData.inviteCode = undefined;
      }
    }

    Object.assign(room, filteredData);
    const savedRoom = await room.save();

    // Return populated room
    return await this.getRoomById(String(savedRoom._id));
  }

  async deleteRoom(id: string, userId: string) {
    const room = await RoomModel.findById(id);

    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    if (room.hostId.toString() !== userId) {
      throw new CustomError("Unauthorized", 403);
    }

    await RoomModel.findByIdAndDelete(id);
  }

  async joinRoom(id: string, userId: string, user: any) {
    const room = await RoomModel.findById(id);

    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    if (room.listenerCount >= room.maxListeners) {
      throw new CustomError("Room is full", 400);
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const isAlreadyMember = room.members.some(
      (m: any) => m.toString() === userId
    );

    if (!isAlreadyMember) {
      room.members.push(userIdObj);
      room.listenerCount += 1;
      await room.save();
    }

    return await RoomModel.findById(id)
      .populate("hostId", "username email avatar")
      .populate("members", "username email avatar");
  }

  async leaveRoom(id: string, userId: string, deleteIfHost: boolean = false) {
    const room = await RoomModel.findById(id);

    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    const isHost = room.hostId.toString() === userId;

    // Remove user from members
    room.members = room.members.filter((m: any) => m.toString() !== userId);
    room.listenerCount = Math.max(0, room.listenerCount - 1);
    await room.save();

    // Only delete room if explicitly requested and user is host
    // This prevents accidental deletion when navigating away
    if (deleteIfHost && isHost) {
      await RoomModel.findByIdAndDelete(id);
    }
  }
}
