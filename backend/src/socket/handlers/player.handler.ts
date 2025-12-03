import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";

export function handlePlayerEvents(
  io: SocketIOServer,
  socket: Socket,
  userSocketMap: Map<string, string>,
  roomSocketMap: Map<string, Set<string>>
) {
  // Play/Pause control (Anyone can control)
  socket.on(
    "player:play-pause",
    async (data: { roomId: string; isPlaying: boolean; userId: string }) => {
      try {
        const { roomId, isPlaying, userId } = data;

        // Verify room exists and user is a member
        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", {
            message: "Room not found"
          });
          return;
        }

        // Check if user is a member of the room
        const isMember = room.members.some(
          (memberId: any) => memberId.toString() === userId
        );
        if (!isMember) {
          socket.emit("player:error", {
            message: "You must be a member of the room to control playback"
          });
          return;
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            lastUpdated: new Date()
          };
        }
        room.playerState.isPlaying = isPlaying;
        room.playerState.lastUpdated = new Date();
        await room.save();

        // Broadcast to room
        io.to(roomId).emit("player:state-changed", {
          isPlaying,
          currentTime: room.playerState.currentTime,
          timestamp: Date.now()
        });

        logger.info(
          `Player ${isPlaying ? "playing" : "paused"} in room ${roomId}`
        );
      } catch (error) {
        logger.error("Error in player:play-pause:", error);
        socket.emit("player:error", { message: "Failed to control playback" });
      }
    }
  );

  // Skip song (Anyone can control)
  socket.on(
    "player:skip",
    async (data: {
      roomId: string;
      direction: "next" | "prev";
      userId: string;
    }) => {
      try {
        const { roomId, direction, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", {
            message: "Room not found"
          });
          return;
        }

        // Check if user is a member of the room
        const isMember = room.members.some(
          (memberId: any) => memberId.toString() === userId
        );
        if (!isMember) {
          socket.emit("player:error", {
            message: "You must be a member of the room to skip songs"
          });
          return;
        }

        if (direction === "next" && room.queue.length > 0) {
          const nextSong = room.queue[0];
          room.currentSong = {
            videoId: nextSong.videoId,
            title: nextSong.title,
            artist: nextSong.artist,
            duration: nextSong.duration
          };
          room.queue.shift();
          // Reset player state for new song
          if (!room.playerState) {
            room.playerState = {
              isPlaying: false,
              currentTime: 0,
              volume: 80,
              lastUpdated: new Date()
            };
          }
          room.playerState.currentTime = 0;
          room.playerState.isPlaying = true;
          room.playerState.lastUpdated = new Date();
          await room.save();
        }

        // Populate requestedBy before emitting
        const populatedRoomForSkip = await RoomModel.findById(roomId)
          .populate("queue.requestedBy", "username email")
          .lean();
        const queueForSkip = populatedRoomForSkip?.queue || room.queue;

        io.to(roomId).emit("player:song-changed", {
          currentSong: room.currentSong,
          queue: queueForSkip,
          playerState: room.playerState
        });

        logger.info(`Song skipped in room ${roomId}`);
      } catch (error) {
        logger.error("Error in player:skip:", error);
        socket.emit("player:error", { message: "Failed to skip song" });
      }
    }
  );

  // Seek (Anyone can control)
  socket.on(
    "player:seek",
    async (data: { roomId: string; time: number; userId: string }) => {
      try {
        const { roomId, time, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        // Check if user is a member of the room
        const isMember = room.members.some(
          (memberId: any) => memberId.toString() === userId
        );
        if (!isMember) {
          socket.emit("player:error", {
            message: "You must be a member of the room to seek"
          });
          return;
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            lastUpdated: new Date()
          };
        }
        room.playerState.currentTime = Math.max(0, time);
        room.playerState.lastUpdated = new Date();
        await room.save();

        io.to(roomId).emit("player:seeked", {
          time: room.playerState.currentTime,
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error("Error in player:seek:", error);
        socket.emit("player:error", { message: "Failed to seek" });
      }
    }
  );

  // Volume control (Anyone can control)
  socket.on(
    "player:volume",
    async (data: { roomId: string; volume: number; userId: string }) => {
      try {
        const { roomId, volume, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", {
            message: "Room not found"
          });
          return;
        }

        // Check if user is a member of the room
        const isMember = room.members.some(
          (memberId: any) => memberId.toString() === userId
        );
        if (!isMember) {
          socket.emit("player:error", {
            message: "You must be a member of the room to control volume"
          });
          return;
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            lastUpdated: new Date()
          };
        }
        room.playerState.volume = Math.max(0, Math.min(100, volume));
        room.playerState.lastUpdated = new Date();
        await room.save();

        io.to(roomId).emit("player:volume-changed", {
          volume: room.playerState.volume,
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error("Error in player:volume:", error);
        socket.emit("player:error", { message: "Failed to change volume" });
      }
    }
  );

  // Add song to queue
  socket.on(
    "player:add-to-queue",
    async (data: {
      roomId: string;
      song: {
        videoId: string;
        title: string;
        artist: string;
        duration: number;
      };
      userId: string;
      playNow?: boolean; // If true, play immediately (host only)
    }) => {
      try {
        const { roomId, song, userId, playNow } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        // If playNow is true and user is host, play immediately
        if (playNow && room.hostId.toString() === userId) {
          room.currentSong = {
            videoId: song.videoId,
            title: song.title,
            artist: song.artist,
            duration: song.duration
          };
          // Reset player state for new song
          if (!room.playerState) {
            room.playerState = {
              isPlaying: false,
              currentTime: 0,
              volume: 80,
              lastUpdated: new Date()
            };
          }
          room.playerState.currentTime = 0;
          room.playerState.isPlaying = true;
          room.playerState.lastUpdated = new Date();
          await room.save();

          // Populate requestedBy before emitting
          const populatedRoomForPlay = await RoomModel.findById(roomId)
            .populate("queue.requestedBy", "username email")
            .lean();
          const queueForPlay = populatedRoomForPlay?.queue || room.queue;

          io.to(roomId).emit("player:song-changed", {
            currentSong: room.currentSong,
            queue: queueForPlay,
            playerState: room.playerState
          });

          logger.info(`Song played immediately in room ${roomId}`);
        } else {
          // Add to queue normally
          room.queue.push({
            ...song,
            requestedBy: userId as any
          });
          await room.save();

          // Populate requestedBy before emitting
          const populatedRoomForAdd = await RoomModel.findById(roomId)
            .populate("queue.requestedBy", "username email")
            .lean();
          const queueForAdd = populatedRoomForAdd?.queue || room.queue;

          io.to(roomId).emit("player:queue-updated", {
            queue: queueForAdd
          });

          logger.info(`Song added to queue in room ${roomId}`);
        }
      } catch (error) {
        logger.error("Error in player:add-to-queue:", error);
        socket.emit("player:error", { message: "Failed to add song to queue" });
      }
    }
  );

  // Get current player state
  socket.on("player:get-state", async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const room = await RoomModel.findById(roomId);

      if (!room) {
        socket.emit("player:error", { message: "Room not found" });
        return;
      }

      // Calculate current time based on last update and playing state
      let currentTime = room.playerState?.currentTime || 0;
      if (room.playerState?.isPlaying && room.playerState.lastUpdated) {
        const timeSinceUpdate =
          (Date.now() - room.playerState.lastUpdated.getTime()) / 1000;
        currentTime = room.playerState.currentTime + timeSinceUpdate;
        // Cap at song duration if available
        if (room.currentSong?.duration) {
          currentTime = Math.min(currentTime, room.currentSong.duration);
        }
      }

      // Populate requestedBy before emitting
      const populatedRoom = await RoomModel.findById(roomId)
        .populate("queue.requestedBy", "username email")
        .lean();
      const queueToEmit = populatedRoom?.queue || room.queue;

      socket.emit("player:state", {
        currentSong: room.currentSong,
        queue: queueToEmit,
        playerState: {
          isPlaying: room.playerState?.isPlaying || false,
          currentTime,
          volume: room.playerState?.volume || 80
        }
      });
    } catch (error) {
      logger.error("Error in player:get-state:", error);
      socket.emit("player:error", { message: "Failed to get player state" });
    }
  });

  // Reorder queue
  socket.on(
    "player:reorder-queue",
    async (data: {
      roomId: string;
      fromIndex: number;
      toIndex: number;
      userId: string;
    }) => {
      try {
        const { roomId, fromIndex, toIndex, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        // Check if user is a member
        const isMember = room.members.some(
          (memberId: any) => memberId.toString() === userId
        );
        if (!isMember) {
          socket.emit("player:error", {
            message: "You must be a member of the room to reorder queue"
          });
          return;
        }

        // Validate indices
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= room.queue.length ||
          toIndex >= room.queue.length
        ) {
          socket.emit("player:error", { message: "Invalid queue indices" });
          return;
        }

        // Reorder queue
        const [movedItem] = room.queue.splice(fromIndex, 1);
        room.queue.splice(toIndex, 0, movedItem);
        await room.save();

        // Broadcast updated queue (populate requestedBy)
        const populatedRoom = await RoomModel.findById(roomId)
          .populate("queue.requestedBy", "username email")
          .lean();
        if (populatedRoom) {
          io.to(roomId).emit("player:queue-updated", {
            queue: populatedRoom.queue
          });
        } else {
          io.to(roomId).emit("player:queue-updated", {
            queue: room.queue
          });
        }

        logger.info(`Queue reordered in room ${roomId}`);
      } catch (error) {
        logger.error("Error in player:reorder-queue:", error);
        socket.emit("player:error", { message: "Failed to reorder queue" });
      }
    }
  );

  // Update player time (called periodically by any user who is playing)
  socket.on(
    "player:update-time",
    async (data: { roomId: string; currentTime: number; userId: string }) => {
      try {
        const { roomId, currentTime, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          return; // Silently ignore if room not found
        }

        // Check if user is a member
        const isMember = room.members.some(
          (memberId: any) => memberId.toString() === userId
        );
        if (!isMember) {
          return; // Silently ignore if not a member
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            lastUpdated: new Date()
          };
        }
        room.playerState.currentTime = Math.max(0, currentTime);
        room.playerState.lastUpdated = new Date();
        await room.save();

        // Broadcast time update to room (except sender)
        socket.to(roomId).emit("player:time-updated", {
          currentTime,
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error("Error in player:update-time:", error);
      }
    }
  );
}
