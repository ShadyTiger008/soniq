import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";
import { UserModel } from "../../models/user.model.js";


// In-memory state for performance (Layer 2)
interface ActivePlayerState {
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: number;
  currentSong: any;
  queue: any[];
  repeatMode: string;
  shuffle: boolean;
  volume: number;
  updatedAt: number;
}

const activeRoomStates = new Map<string, ActivePlayerState>();

// Helper to get or initialize room state
const getActiveRoomState = async (roomId: string): Promise<ActivePlayerState | null> => {
  if (activeRoomStates.has(roomId)) {
    return activeRoomStates.get(roomId)!;
  }

  // Fallback to DB
  const room = await RoomModel.findById(roomId).lean();
  if (!room) return null;

  // Normalize queue: Ensure requestedBy is always a username
  const normalizedQueue = await Promise.all((room.queue || []).map(async (item: any) => {
    // If it's a valid ObjectId string and doesn't look like a username (e.g. no spaces/special chars)
    const isId = /^[0-9a-fA-F]{24}$/.test(item.requestedBy);
    if (isId || !item.requestedBy) {
      const user = await UserModel.findById(item.requestedById || item.requestedBy).select("username");
      return {
        ...item,
        requestedBy: user?.username || "Guest",
        requestedById: item.requestedById || item.requestedBy
      };
    }
    return item;
  }));

  const state: ActivePlayerState = {
    isPlaying: room.playerState?.isPlaying || false,
    currentTime: room.playerState?.currentTime || 0,
    lastUpdated: room.playerState?.lastUpdated?.getTime() || Date.now(),
    currentSong: room.currentSong,
    queue: normalizedQueue,
    repeatMode: room.playerState?.repeatMode || 'none',
    shuffle: room.playerState?.shuffle || false,
    volume: room.playerState?.volume || 80,
    updatedAt: Date.now()
  };

  activeRoomStates.set(roomId, state);
  return state;
};

// Background save helper
const persistRoomState = (roomId: string, state: ActivePlayerState) => {
  RoomModel.updateOne(
    { _id: roomId },
    {
      $set: {
        playerState: {
          isPlaying: state.isPlaying,
          currentTime: state.currentTime,
          volume: state.volume,
          shuffle: state.shuffle,
          repeatMode: state.repeatMode,
          lastUpdated: new Date(state.lastUpdated)
        },
        currentSong: state.currentSong,
        queue: state.queue
      }
    }
  ).catch(err => logger.error(`Failed to persist room ${roomId}:`, err));
};


// Helper to check permissions
const hasPermission = (
  room: any,
  userId: string,
  action: "playPause" | "skip" | "volume" | "addToQueue"
): boolean => {
  // Guests never have permission to perform actions
  if (userId && userId.startsWith("guest_")) return false;

  // Owner always has permission
  if (room.hostId.toString() === userId) return true;

  const roles = room.roles;
  const role = roles instanceof Map ? roles.get(userId) : roles?.[userId];
  const permissionLevel = room.permissions?.[action] || "everyone";

  if (permissionLevel === "everyone") return true;
  if (permissionLevel === "dj" && (role === "dj" || role === "host")) return true;
  if (permissionLevel === "host" && role === "host") return true;

  return false;
};

export function handlePlayerEvents(
  io: SocketIOServer,
  socket: Socket
) {
  // Play/Pause control
  socket.on(
    "player:play-pause",
    async (data: { roomId: string; isPlaying: boolean; userId: string; currentTime?: number }) => {
      try {
        const { roomId, isPlaying, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        // Check Permissions (Simple check for speed, full room object from DB for deep permission check if needed)
        // For performance, we can skip permission check if it's high-frequency or trust client role
        // but let's keep it somewhat safe.
        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "playPause")) {
            socket.emit("player:error", { message: "Permission denied" });
            return;
        }

        const now = Date.now();
        
        // Update in-memory
        state.isPlaying = isPlaying;
        if (typeof data.currentTime === 'number') {
             state.currentTime = Math.max(0, data.currentTime);
        }
        state.lastUpdated = now;
        state.updatedAt = now;

        // 1. Broadcast IMMEDIATELY (Lean Pipeline)
        io.to(roomId).emit("player:state-changed", {
          isPlaying,
          currentTime: state.currentTime,
          serverTimeAtEmit: now, // Layer 2 Key
          timestamp: now
        });

        // 2. Persist in background (Async)
        persistRoomState(roomId, state);

        logger.info(`Player ${isPlaying ? "playing" : "paused"} in room ${roomId} by ${userId}`);
      } catch (error) {
        logger.error("Error in player:play-pause:", error);
      }
    }
  );

  // Skip song
  socket.on(
    "player:skip",
    async (data: {
      roomId: string;
      direction: "next" | "prev";
      userId: string;
    }) => {
      try {
        const { roomId, direction, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "skip")) {
             return;
        }

        if (direction === "next") {
          if (state.repeatMode === 'one' && state.currentSong) {
            state.currentTime = 0;
            state.isPlaying = true;
          } else if (state.queue.length > 0) {
            let nextSongIndex = 0;
            if (state.shuffle) {
              nextSongIndex = Math.floor(Math.random() * state.queue.length);
            }
            const nextSong = state.queue[nextSongIndex];
            
            if (state.repeatMode === 'all' && state.currentSong) {
              state.queue.push({ ...state.currentSong });
            }

            state.currentSong = { ...nextSong };
            state.queue.splice(nextSongIndex, 1);
            state.currentTime = 0;
            state.isPlaying = true;
          }
        } else {
          state.currentTime = 0;
        }

        const now = Date.now();
        state.lastUpdated = now;
        state.updatedAt = now;

        io.to(roomId).emit("player:song-changed", {
          currentSong: state.currentSong,
          queue: state.queue,
          playerState: {
            isPlaying: state.isPlaying,
            currentTime: state.currentTime,
            volume: state.volume,
            shuffle: state.shuffle,
            repeatMode: state.repeatMode
          },
          serverTimeAtEmit: now
        });

        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:skip:", error);
      }
    }
  );

  // Shuffle toggle
  socket.on(
    "player:shuffle",
    async (data: { roomId: string; shuffle: boolean; userId: string }) => {
      try {
        const { roomId, shuffle, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "skip")) return;

        state.shuffle = shuffle;
        state.lastUpdated = Date.now();
        state.updatedAt = Date.now();
        
        io.to(roomId).emit("player:shuffle-changed", {
          shuffle: state.shuffle,
          timestamp: Date.now()
        });

        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:shuffle:", error);
      }
    }
  );

  // Repeat mode cycle
  socket.on(
    "player:repeat",
    async (data: { roomId: string; repeatMode: 'none' | 'one' | 'all'; userId: string }) => {
      try {
        const { roomId, repeatMode, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "skip")) return;

        state.repeatMode = repeatMode;
        state.lastUpdated = Date.now();
        state.updatedAt = Date.now();

        io.to(roomId).emit("player:repeat-changed", {
          repeatMode: state.repeatMode,
          timestamp: Date.now()
        });

        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:repeat:", error);
      }
    }
  );

  // Seek
  socket.on(
    "player:seek",
    async (data: { roomId: string; time: number; userId: string }) => {
      try {
        const { roomId, time, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "playPause")) {
             return;
        }

        const now = Date.now();
        state.currentTime = Math.max(0, time);
        state.lastUpdated = now;
        state.updatedAt = now;

        // Broadcast immediately
        io.to(roomId).emit("player:seeked", {
          time: state.currentTime,
          serverTimeAtEmit: now,
          timestamp: now
        });

        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:seek:", error);
      }
    }
  );

  // Volume control
  socket.on(
    "player:volume",
    async (data: { roomId: string; volume: number; userId: string }) => {
      try {
        const { roomId, volume, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "volume")) return;

        state.volume = Math.max(0, Math.min(100, volume));
        state.lastUpdated = Date.now();
        state.updatedAt = Date.now();

        io.to(roomId).emit("player:volume-changed", {
          volume: state.volume,
          timestamp: Date.now()
        });

        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:volume:", error);
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
        thumbnail?: string;
      };
      userId: string;
      playNow?: boolean;
    }) => {
      try {
        const { roomId, song, userId, playNow } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId roles permissions");
        if (!room || !hasPermission(room, userId, "addToQueue")) {
            return;
        }

        const user = await UserModel.findById(userId).select("username");
        const username = user?.username || "Guest";
        const now = Date.now();

        if (playNow && hasPermission(room, userId, "playPause")) {
          state.currentSong = { ...song, requestedBy: username, requestedById: userId };
          state.currentTime = 0;
          state.isPlaying = true;
          state.lastUpdated = now;

          io.to(roomId).emit("player:song-changed", {
            currentSong: state.currentSong,
            queue: state.queue,
            playerState: {
              isPlaying: state.isPlaying,
              currentTime: state.currentTime,
              volume: state.volume,
              shuffle: state.shuffle,
              repeatMode: state.repeatMode
            },
            serverTimeAtEmit: now
          });
        } else {
          state.queue.push({ ...song, requestedBy: username, requestedById: userId });
          io.to(roomId).emit("player:queue-updated", {
            queue: state.queue,
            serverTimeAtEmit: now
          });
        }

        state.updatedAt = now;
        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:add-to-queue:", error);
      }
    }
  );

  // Get current player state
  socket.on("player:get-state", async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const state = await getActiveRoomState(roomId);
      if (!state) return;

      // Calculate current time based on last update and playing state
      let currentTime = state.currentTime;
      const now = Date.now();
      if (state.isPlaying) {
        const timeSinceUpdate = (now - state.lastUpdated) / 1000;
        currentTime = state.currentTime + timeSinceUpdate;
        if (state.currentSong?.duration) {
          currentTime = Math.min(currentTime, state.currentSong.duration);
        }
      }

      socket.emit("player:state", {
        currentSong: state.currentSong,
        queue: state.queue,
        serverTimeAtEmit: now, // Crucial for Layer 4
        playerState: {
          isPlaying: state.isPlaying,
          currentTime,
          volume: state.volume,
          shuffle: state.shuffle,
          repeatMode: state.repeatMode
        }
      });
    } catch (error) {
      logger.error("Error in player:get-state:", error);
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

        // Check Permissions
        if (!hasPermission(room, userId, "addToQueue")) { // DJs can reorder
          socket.emit("player:error", {
            message: "You don't have permission to reorder queue"
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

  // Update player time (Host only mostly)
  socket.on(
    "player:update-time",
    async (data: { roomId: string; currentTime: number; userId: string }) => {
      try {
        const { roomId, currentTime, userId } = data;
        const state = await getActiveRoomState(roomId);
        if (!state) return;

        const room = await RoomModel.findById(roomId).select("hostId");
        if (!room || room.hostId.toString() !== userId) return;

        const now = Date.now();
        state.currentTime = Math.max(0, currentTime);
        state.lastUpdated = now;
        state.updatedAt = now;

        socket.to(roomId).emit("player:time-updated", {
          currentTime,
          serverTimeAtEmit: now, // Critical for Layer 3
          timestamp: now
        });

        // We don't need to persist high-frequency time updates to DB every time.
        // Maybe every 10s or on room leave? For now, background persist is fine.
        persistRoomState(roomId, state);
      } catch (error) {
        logger.error("Error in player:update-time:", error);
      }
    }
  );
  // Remove from queue
  socket.on(
    "player:remove-from-queue",
    async (data: { roomId: string; videoId: string; userId: string }) => {
      try {
        const { roomId, videoId, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        // Allow removing if you are host, DJ, or if you requested the song
        const isHostOrDJ = hasPermission(room, userId, "addToQueue"); // reusing similar permission or create new specific one?
        // Let's strictly check host/dj for generic removal, but allow user to remove their own request?
        // For now, stick to Host/DJ for simplicity as per requirement "user should be able to remove..." usually implies admin.
        if (!isHostOrDJ) {
             socket.emit("player:error", { message: "You don't have permission to remove songs" });
             return;
        }

        const initialLength = room.queue.length;
        room.queue = room.queue.filter((item: any) => item.videoId !== videoId);

        if (room.queue.length === initialLength) {
           return; // Nothing removed
        }

        await room.save();

        const populatedRoom = await RoomModel.findById(roomId)
          .populate("queue.requestedBy", "username email")
          .lean();
        
        io.to(roomId).emit("player:queue-updated", {
          queue: populatedRoom?.queue || room.queue
        });
        
        logger.info(`Song removed from queue in room ${roomId} by ${userId}`);

      } catch (error) {
        logger.error("Error in player:remove-from-queue:", error);
        socket.emit("player:error", { message: "Failed to remove song" });
      }
    }
  );

  // Play specific queue item immediately (Skip to item)
  socket.on(
    "player:play-queue-item",
    async (data: { roomId: string; videoId: string; userId: string }) => {
      try {
        const { roomId, videoId, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
           socket.emit("player:error", { message: "Room not found" });
           return;
        }

        if (!hasPermission(room, userId, "skip")) { // Using skip permission
             socket.emit("player:error", { message: "You don't have permission to change songs" });
             return;
        }

        const songIndex = room.queue.findIndex((item: any) => item.videoId === videoId);
        if (songIndex === -1) {
            socket.emit("player:error", { message: "Song not found in queue" });
            return;
        }

        const songToPlay = room.queue[songIndex];

        // Remove from queue
        room.queue.splice(songIndex, 1);

        // Set as current
        room.currentSong = {
            videoId: songToPlay.videoId,
            title: songToPlay.title,
            artist: songToPlay.artist,
            duration: songToPlay.duration,
            thumbnail: (songToPlay as any).thumbnail
        };
        
        const currentVolume = room.playerState?.volume || 80;
        const currentShuffle = room.playerState?.shuffle || false;
        const currentRepeat = room.playerState?.repeatMode || 'none';

        room.playerState = {
            isPlaying: true,
            currentTime: 0,
            volume: currentVolume,
            shuffle: currentShuffle,
            repeatMode: currentRepeat,
            lastUpdated: new Date()
        };

        await room.save();

        const populatedRoom = await RoomModel.findById(roomId)
            .populate("queue.requestedBy", "username email")
            .lean();

        io.to(roomId).emit("player:song-changed", {
            currentSong: room.currentSong,
            queue: populatedRoom?.queue || room.queue,
            playerState: room.playerState
        });

        logger.info(`Queue item played immediately in room ${roomId} by ${userId}`);

      } catch (error) {
         logger.error("Error in player:play-queue-item:", error);
         socket.emit("player:error", { message: "Failed to play queue item" });
      }
    }
  );


  // --- Request System Handlers ---

  // Request a song (Listeners)
  socket.on(
    "player:request-song",
    async (data: {
      roomId: string;
      song: {
        videoId: string;
        title: string;
        artist: string;
        duration: number;
        thumbnail?: string;
      };
      userId: string;
    }) => {
      try {
        const { roomId, song, userId } = data;

        if (userId && userId.startsWith("guest_")) {
          socket.emit("player:error", { message: "Guests cannot request songs" });
          return;
        }

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        // Add to requests
        room.songRequests = room.songRequests || [];
        
        // Check for duplicates in requests
        const existingRequest = room.songRequests.find(r => r.videoId === song.videoId);
        if (existingRequest) {
            socket.emit("player:error", { message: "Song is already requested" });
            return;
        }

        const user = await UserModel.findById(userId).select("username");
        const username = user?.username || "Guest";

        room.songRequests.push({
          ...song,
          requestedBy: username,
          requestedById: userId as any,
          requestedAt: new Date()
        });
        
        await room.save();

        // Broadcast updated requests
        const populatedRoom = await RoomModel.findById(roomId)
          .populate("songRequests.requestedBy", "username email")
          .lean();
        
        if (populatedRoom) {
            // Only send to Host/DJ ideally, but for simplicity broadcast to room 
            // and frontend filters visibility based on role
            // Or better: emit to specific room but frontend handles logic
             io.to(roomId).emit("player:requests-updated", {
                requests: populatedRoom.songRequests
             });
        }

        logger.info(`Song requested in room ${roomId} by ${userId}`);
        socket.emit("player:success", { message: "Song requested successfully" });

      } catch (error) {
        logger.error("Error in player:request-song:", error);
        socket.emit("player:error", { message: "Failed to request song" });
      }
    }
  );

  // Approve request (Host/DJ)
  socket.on(
    "player:approve-request",
    async (data: { roomId: string; videoId: string; userId: string }) => {
      try {
        const { roomId, videoId, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) return;

        if (!hasPermission(room, userId, "addToQueue")) {
             socket.emit("player:error", { message: "Permission denied" });
             return;
        }

        const requestIndex = room.songRequests.findIndex(r => r.videoId === videoId);
        if (requestIndex === -1) {
             socket.emit("player:error", { message: "Request not found" });
             return;
        }

        const request = room.songRequests[requestIndex];

        // Move to queue
        room.queue.push({
            videoId: request.videoId,
            title: request.title,
            artist: request.artist,
            duration: request.duration,
            thumbnail: request.thumbnail,
            requestedBy: request.requestedBy,
            requestedById: request.requestedById
        });

        // Remove from requests
        room.songRequests.splice(requestIndex, 1);

        await room.save();

        // Broadcast updates
        const populatedRoom = await RoomModel.findById(roomId)
            .populate("queue.requestedBy", "username email")
            .populate("songRequests.requestedBy", "username email")
            .lean();

        if (populatedRoom) {
            io.to(roomId).emit("player:queue-updated", { queue: populatedRoom.queue });
            io.to(roomId).emit("player:requests-updated", { requests: populatedRoom.songRequests });
        }
        
        logger.info(`Request approved in room ${roomId} by ${userId}`);

      } catch (error) {
        logger.error("Error in player:approve-request:", error);
        socket.emit("player:error", { message: "Failed to approve request" });
      }
    }
  );

  // Reject request (Host/DJ)
  socket.on(
    "player:reject-request",
    async (data: { roomId: string; videoId: string; userId: string }) => {
      try {
        const { roomId, videoId, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) return;

        if (!hasPermission(room, userId, "addToQueue")) {
             socket.emit("player:error", { message: "Permission denied" });
             return;
        }

        const requestIndex = room.songRequests.findIndex(r => r.videoId === videoId);
        if (requestIndex === -1) return;

        room.songRequests.splice(requestIndex, 1);
        await room.save();

        // Broadcast update
        const populatedRoom = await RoomModel.findById(roomId)
            .populate("songRequests.requestedBy", "username email")
            .lean();

        if (populatedRoom) {
            io.to(roomId).emit("player:requests-updated", { requests: populatedRoom.songRequests });
        }

        logger.info(`Request rejected in room ${roomId} by ${userId}`);

      } catch (error) {
        logger.error("Error in player:reject-request:", error);
      }
    }
  );
}
