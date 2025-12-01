import { RoomModel } from "../models/room.model.js";
import { CustomError } from "../middleware/errorHandler.js";

export class RoomService {
  async createRoom(roomData: any) {
    const room = new RoomModel(roomData);
    return await room.save();
  }

  async getRooms(filters: { page: number; limit: number; mood?: string; search?: string }) {
    const query: any = {};
    
    if (filters.mood) {
      query.mood = filters.mood;
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const rooms = await RoomModel.find(query)
      .limit(filters.limit)
      .skip((filters.page - 1) * filters.limit)
      .sort({ createdAt: -1 });

    const total = await RoomModel.countDocuments(query);

    return {
      rooms,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getRoomById(id: string) {
    return await RoomModel.findById(id).populate("hostId", "username email");
  }

  async updateRoom(id: string, userId: string, updateData: any) {
    const room = await RoomModel.findById(id);
    
    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    if (room.hostId.toString() !== userId) {
      throw new CustomError("Unauthorized", 403);
    }

    Object.assign(room, updateData);
    return await room.save();
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

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      room.listenerCount += 1;
      await room.save();
    }

    return room;
  }

  async leaveRoom(id: string, userId: string) {
    const room = await RoomModel.findById(id);
    
    if (!room) {
      throw new CustomError("Room not found", 404);
    }

    room.members = room.members.filter((m: string) => m.toString() !== userId);
    room.listenerCount = Math.max(0, room.listenerCount - 1);
    await room.save();
  }
}

