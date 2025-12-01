import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";

export function handlePlayerEvents(
  io: SocketIOServer,
  socket: Socket,
  userSocketMap: Map<string, string>,
  roomSocketMap: Map<string, Set<string>>
) {
  // Play/Pause control (DJ only)
  socket.on("player:play-pause", async (data: {
    roomId: string;
    isPlaying: boolean;
    userId: string;
  }) => {
    try {
      const { roomId, isPlaying, userId } = data;

      // Verify user is room host
      const room = await RoomModel.findById(roomId);
      if (!room || room.hostId.toString() !== userId) {
        socket.emit("player:error", { message: "Only room host can control playback" });
        return;
      }

      // Broadcast to room
      io.to(roomId).emit("player:state-changed", {
        isPlaying,
        timestamp: Date.now(),
      });

      logger.info(`Player ${isPlaying ? "playing" : "paused"} in room ${roomId}`);
    } catch (error) {
      logger.error("Error in player:play-pause:", error);
      socket.emit("player:error", { message: "Failed to control playback" });
    }
  });

  // Skip song (DJ only)
  socket.on("player:skip", async (data: {
    roomId: string;
    direction: "next" | "prev";
    userId: string;
  }) => {
    try {
      const { roomId, direction, userId } = data;

      const room = await RoomModel.findById(roomId);
      if (!room || room.hostId.toString() !== userId) {
        socket.emit("player:error", { message: "Only room host can skip songs" });
        return;
      }

      if (direction === "next" && room.queue.length > 0) {
        const nextSong = room.queue[0];
        room.currentSong = {
          videoId: nextSong.videoId,
          title: nextSong.title,
          artist: nextSong.artist,
          duration: nextSong.duration,
        };
        room.queue.shift();
        await room.save();
      }

      io.to(roomId).emit("player:song-changed", {
        currentSong: room.currentSong,
        queue: room.queue,
      });

      logger.info(`Song skipped in room ${roomId}`);
    } catch (error) {
      logger.error("Error in player:skip:", error);
      socket.emit("player:error", { message: "Failed to skip song" });
    }
  });

  // Seek (DJ only)
  socket.on("player:seek", async (data: {
    roomId: string;
    time: number;
    userId: string;
  }) => {
    try {
      const { roomId, time, userId } = data;

      const room = await RoomModel.findById(roomId);
      if (!room || room.hostId.toString() !== userId) {
        socket.emit("player:error", { message: "Only room host can seek" });
        return;
      }

      io.to(roomId).emit("player:seeked", {
        time,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Error in player:seek:", error);
      socket.emit("player:error", { message: "Failed to seek" });
    }
  });

  // Volume control (DJ only)
  socket.on("player:volume", async (data: {
    roomId: string;
    volume: number;
    userId: string;
  }) => {
    try {
      const { roomId, volume, userId } = data;

      const room = await RoomModel.findById(roomId);
      if (!room || room.hostId.toString() !== userId) {
        socket.emit("player:error", { message: "Only room host can control volume" });
        return;
      }

      io.to(roomId).emit("player:volume-changed", {
        volume: Math.max(0, Math.min(100, volume)),
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Error in player:volume:", error);
      socket.emit("player:error", { message: "Failed to change volume" });
    }
  });

  // Add song to queue
  socket.on("player:add-to-queue", async (data: {
    roomId: string;
    song: {
      videoId: string;
      title: string;
      artist: string;
      duration: number;
    };
    userId: string;
  }) => {
    try {
      const { roomId, song, userId } = data;

      const room = await RoomModel.findById(roomId);
      if (!room) {
        socket.emit("player:error", { message: "Room not found" });
        return;
      }

      room.queue.push({
        ...song,
        requestedBy: userId as any,
      });
      await room.save();

      io.to(roomId).emit("player:queue-updated", {
        queue: room.queue,
      });

      logger.info(`Song added to queue in room ${roomId}`);
    } catch (error) {
      logger.error("Error in player:add-to-queue:", error);
      socket.emit("player:error", { message: "Failed to add song to queue" });
    }
  });

  // Get current player state
  socket.on("player:get-state", async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const room = await RoomModel.findById(roomId);

      if (!room) {
        socket.emit("player:error", { message: "Room not found" });
        return;
      }

      socket.emit("player:state", {
        currentSong: room.currentSong,
        queue: room.queue,
      });
    } catch (error) {
      logger.error("Error in player:get-state:", error);
      socket.emit("player:error", { message: "Failed to get player state" });
    }
  });
}

