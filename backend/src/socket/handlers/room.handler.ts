import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";

export function handleRoomEvents(
  io: SocketIOServer,
  socket: Socket,
  userSocketMap: Map<string, string>,
  roomSocketMap: Map<string, Set<string>>
) {
  // Join room
  socket.on("room:join", async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const userId = (socket.handshake.auth?.userId as string) || socket.id;

      // Verify room exists
      const room = await RoomModel.findById(roomId);
      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }

      // Check if room is full
      if (room.listenerCount >= room.maxListeners) {
        socket.emit("room:error", { message: "Room is full" });
        return;
      }

      // Join socket room
      await socket.join(roomId);

      // Track socket in room
      if (!roomSocketMap.has(roomId)) {
        roomSocketMap.set(roomId, new Set());
      }
      roomSocketMap.get(roomId)!.add(socket.id);

      // Update room member count
      if (!room.members.includes(userId as any)) {
        room.members.push(userId as any);
        room.listenerCount += 1;
        await room.save();
      }

      // Notify others in room
      socket.to(roomId).emit("room:member-joined", {
        userId,
        listenerCount: room.listenerCount
      });

      // Broadcast updated members list to all in room
      const updatedRoom = await RoomModel.findById(roomId)
        .populate("members", "username email avatar")
        .lean();
      if (updatedRoom) {
        io.to(roomId).emit("room:members", {
          members: updatedRoom.members,
          listenerCount: updatedRoom.listenerCount
        });
      }

      // Calculate current player time if playing
      let currentTime = room.playerState?.currentTime || 0;
      if (room.playerState?.isPlaying && room.playerState.lastUpdated) {
        const timeSinceUpdate =
          (Date.now() - room.playerState.lastUpdated.getTime()) / 1000;
        currentTime = room.playerState.currentTime + timeSinceUpdate;
        if (room.currentSong?.duration) {
          currentTime = Math.min(currentTime, room.currentSong.duration);
        }
      }

      // Send room data to client with player state
      socket.emit("room:joined", {
        room: room.toObject(),
        listenerCount: room.listenerCount,
        playerState: {
          isPlaying: room.playerState?.isPlaying || false,
          currentTime,
          volume: room.playerState?.volume || 80
        }
      });

      logger.info(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      logger.error("Error in room:join:", error);
      socket.emit("room:error", { message: "Failed to join room" });
    }
  });

  // Leave room
  socket.on("room:leave", async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const userId = (socket.handshake.auth?.userId as string) || socket.id;

      await socket.leave(roomId);

      // Remove from room tracking
      const roomSockets = roomSocketMap.get(roomId);
      if (roomSockets) {
        roomSockets.delete(socket.id);
        if (roomSockets.size === 0) {
          roomSocketMap.delete(roomId);
        }
      }

      // Update room member count
      const room = await RoomModel.findById(roomId);
      if (room) {
        room.members = room.members.filter((m: any) => m.toString() !== userId);
        room.listenerCount = Math.max(0, room.listenerCount - 1);
        await room.save();

        // Notify others in room
        socket.to(roomId).emit("room:member-left", {
          userId,
          listenerCount: room.listenerCount
        });

        // Broadcast updated members list to all in room
        const updatedRoom = await RoomModel.findById(roomId)
          .populate("members", "username email avatar")
          .lean();
        if (updatedRoom) {
          io.to(roomId).emit("room:members", {
            members: updatedRoom.members,
            listenerCount: updatedRoom.listenerCount
          });
        }
      }

      logger.info(`User ${userId} left room ${roomId}`);
    } catch (error) {
      logger.error("Error in room:leave:", error);
    }
  });

  // Get room members
  socket.on("room:get-members", async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const room = await RoomModel.findById(roomId).populate(
        "members",
        "username email avatar"
      );

      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }

      socket.emit("room:members", {
        members: room.members,
        listenerCount: room.listenerCount
      });
    } catch (error) {
      logger.error("Error in room:get-members:", error);
      socket.emit("room:error", { message: "Failed to get members" });
    }
  });
}
