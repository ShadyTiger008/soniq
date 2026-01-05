import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";

// Helper to check permissions
const hasPermission = (
  room: any,
  userId: string,
  action: "playPause" | "skip" | "volume" | "addToQueue"
): boolean => {
  // Owner always has permission
  if (room.hostId.toString() === userId) return true;

  const role = room.roles?.get(userId);
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

        // Verify room exists
        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        // Check Permissions
        if (!hasPermission(room, userId, "playPause")) {
            socket.emit("player:error", { message: "You don't have permission to control playback" });
            return;
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            shuffle: false,
            repeatMode: 'none',
            lastUpdated: new Date()
          };
        }
        
        const now = Date.now();
        room.playerState.isPlaying = isPlaying;
        
        // If client provided a specific time, update it strictly
        if (typeof data.currentTime === 'number') {
             room.playerState.currentTime = Math.max(0, data.currentTime);
        }
        
        room.playerState.lastUpdated = new Date(now);
        await room.save();

        // Broadcast to room with EXACT server timestamp for sync
        io.to(roomId).emit("player:state-changed", {
          isPlaying,
          currentTime: room.playerState.currentTime,
          timestamp: now
        });

        logger.info(
          `Player ${isPlaying ? "playing" : "paused"} in room ${roomId} by ${userId}`
        );
      } catch (error) {
        logger.error("Error in player:play-pause:", error);
        socket.emit("player:error", { message: "Failed to control playback" });
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

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        if (!hasPermission(room, userId, "skip")) {
             socket.emit("player:error", { message: "You don't have permission to skip songs" });
             return;
        }

        const playerState = room.playerState || {
          isPlaying: false,
          currentTime: 0,
          volume: 80,
          shuffle: false,
          repeatMode: 'none',
          lastUpdated: new Date()
        };

        if (direction === "next") {
          // Handle Repeat One
          if (playerState.repeatMode === 'one' && room.currentSong) {
            // Re-play the same song
            playerState.currentTime = 0;
            playerState.isPlaying = true;
            playerState.lastUpdated = new Date();
          } else if (room.queue.length > 0) {
            let nextSongIndex = 0;
            
            // Handle Shuffle
            if (playerState.shuffle) {
              nextSongIndex = Math.floor(Math.random() * room.queue.length);
            }

            const nextSong = room.queue[nextSongIndex];
            
            // Handle Repeat All: Put current song back to queue
            if (playerState.repeatMode === 'all' && room.currentSong) {
              room.queue.push({
                videoId: room.currentSong.videoId,
                title: room.currentSong.title,
                artist: room.currentSong.artist,
                duration: room.currentSong.duration,
                thumbnail: room.currentSong.thumbnail,
                requestedBy: userId as any // Or keep original requester if available
              });
            }

            room.currentSong = {
              videoId: nextSong.videoId,
              title: nextSong.title,
              artist: nextSong.artist,
              duration: nextSong.duration,
              thumbnail: (nextSong as any).thumbnail
            };
            
            room.queue.splice(nextSongIndex, 1);
            
            playerState.currentTime = 0;
            playerState.isPlaying = true;
            playerState.lastUpdated = new Date();
          } else if (playerState.repeatMode === 'all' && room.currentSong) {
            // Repeat current song if queue is empty but repeat all is on
            playerState.currentTime = 0;
            playerState.isPlaying = true;
            playerState.lastUpdated = new Date();
          }
        } else {
          // Skip Previous: Just reset current song to 0 for now
          // A more complex implementation would keep track of history
          playerState.currentTime = 0;
          playerState.lastUpdated = new Date();
        }

        room.playerState = playerState as any;
        await room.save();

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

        logger.info(`Song skipped in room ${roomId} by ${userId}`);
      } catch (error) {
        logger.error("Error in player:skip:", error);
        socket.emit("player:error", { message: "Failed to skip song" });
      }
    }
  );

  // Shuffle toggle
  socket.on(
    "player:shuffle",
    async (data: { roomId: string; shuffle: boolean; userId: string }) => {
      try {
        const { roomId, shuffle, userId } = data;
        const room = await RoomModel.findById(roomId);
        if (!room) return;

        if (!hasPermission(room, userId, "skip")) {
          socket.emit("player:error", { message: "Permission denied" });
          return;
        }

        if (!room.playerState) {
          room.playerState = { isPlaying: false, currentTime: 0, volume: 80, shuffle: false, repeatMode: 'none', lastUpdated: new Date() };
        }
        
        room.playerState!.shuffle = shuffle;
        room.playerState!.lastUpdated = new Date();
        await room.save();

        io.to(roomId).emit("player:shuffle-changed", {
          shuffle: room.playerState.shuffle,
          timestamp: Date.now()
        });
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
        const room = await RoomModel.findById(roomId);
        if (!room) return;

        if (!hasPermission(room, userId, "skip")) {
          socket.emit("player:error", { message: "Permission denied" });
          return;
        }

        if (!room.playerState) {
          room.playerState = { isPlaying: false, currentTime: 0, volume: 80, shuffle: false, repeatMode: 'none', lastUpdated: new Date() };
        }
        
        room.playerState!.repeatMode = repeatMode;
        room.playerState!.lastUpdated = new Date();
        await room.save();

        io.to(roomId).emit("player:repeat-changed", {
          repeatMode: room.playerState.repeatMode,
          timestamp: Date.now()
        });
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

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        if (!hasPermission(room, userId, "playPause")) { // Using playPause perm for seek typically
             socket.emit("player:error", { message: "You don't have permission to seek" });
             return;
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            shuffle: false,
            repeatMode: 'none',
            lastUpdated: new Date()
          };
        }
        room.playerState!.currentTime = Math.max(0, time);
        room.playerState!.lastUpdated = new Date();
        await room.save();

        io.to(roomId).emit("player:seeked", {
          time: room.playerState!.currentTime,
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error("Error in player:seek:", error);
        socket.emit("player:error", { message: "Failed to seek" });
      }
    }
  );

  // Volume control
  socket.on(
    "player:volume",
    async (data: { roomId: string; volume: number; userId: string }) => {
      try {
        const { roomId, volume, userId } = data;

        const room = await RoomModel.findById(roomId);
        if (!room) {
          socket.emit("player:error", { message: "Room not found" });
          return;
        }

        if (!hasPermission(room, userId, "volume")) {
             socket.emit("player:error", { message: "You don't have permission to change volume" });
             return;
        }

        // Update player state in database
        if (!room.playerState) {
          room.playerState = {
            isPlaying: false,
            currentTime: 0,
            volume: 80,
            shuffle: false,
            repeatMode: 'none',
            lastUpdated: new Date()
          };
        }
        room.playerState!.volume = Math.max(0, Math.min(100, volume));
        room.playerState!.lastUpdated = new Date();
        await room.save();

        io.to(roomId).emit("player:volume-changed", {
          volume: room.playerState!.volume,
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
        thumbnail?: string; // Add thumbnail
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

        if (!hasPermission(room, userId, "addToQueue")) {
            socket.emit("player:error", { message: "You don't have permission to add songs" });
            return;
        }

        // If playNow is true and user has permission, play immediately
        if (playNow && hasPermission(room, userId, "playPause")) {
          // Check if song exists in queue and remove it to prevent duplicates
          const exisitingIndex = room.queue.findIndex(
            (item: any) => item.videoId === song.videoId
          );
          
          if (exisitingIndex !== -1) {
            room.queue.splice(exisitingIndex, 1);
          }

          room.currentSong = {
            videoId: song.videoId,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            thumbnail: song.thumbnail
          };
          // Reset player state for new song
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

          logger.info(`Song played immediately in room ${roomId} by ${userId}`);
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

          logger.info(`Song added to queue in room ${roomId} by ${userId}`);
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

        // Since this is high-frequency, we might want to optimize. 
        // But to be safe, we should verify the user is the host.
        // We can optimize by assuming the client wouldn't emit if not host (frontend check),
        // but backend must verify.
        
        // Fast path: Update if user is host
        // We need to know who the host is. We can query just the hostId.
        const room = await RoomModel.findById(roomId).select("hostId playerState");
        
        if (!room) return;
        
         // Only HOST updates time to prevent conflicts
        if (room.hostId.toString() !== userId) {
            // Alternatively, allow DJs. But time sync is best single-source.
            return;
        }

        const now = Date.now();
        
        // Update DB
        room.playerState = {
            ...room.playerState,
            currentTime: Math.max(0, currentTime),
            lastUpdated: new Date(now)
        } as any;
        
        await RoomModel.updateOne({ _id: roomId }, { $set: { playerState: room.playerState }});

        // Broadcast time update to room (except sender)
        // Include SERVER TIMESTAMP for sync
        socket.to(roomId).emit("player:time-updated", {
          currentTime,
          timestamp: now
        });
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

        room.songRequests.push({
          ...song,
          requestedBy: userId as any,
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
            requestedBy: request.requestedBy
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
