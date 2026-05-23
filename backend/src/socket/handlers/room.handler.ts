import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";
import { HistoryModel } from "../../models/history.model.js";

export function handleRoomEvents(
  io: SocketIOServer,
  socket: Socket,
  userSocketMap: Map<string, string>,
  roomSocketMap: Map<string, Set<string>>
) {
  // Helper to enrich active members in room using socket data
  const getActiveMembers = async (roomId: string, room: any) => {
    const socketIds = roomSocketMap.get(roomId) || new Set();
    const hostId = room.hostId.toString();
    const activeMembers = [];

    for (const socketId of socketIds) {
      const socketInRoom = io.sockets.sockets.get(socketId);
      if (socketInRoom && socketInRoom.data.user) {
        const userObj = { ...socketInRoom.data.user };
        const memberId = userObj._id.toString();

        let role = "listener";
        if (hostId === memberId) {
          role = "host";
        } else if (room.roles) {
          const roleValue = (room.roles instanceof Map || typeof room.roles.get === 'function')
            ? room.roles.get(memberId)
            : room.roles[memberId];
          if (roleValue) role = roleValue;
        }
        userObj.role = role;
        activeMembers.push(userObj);
      }
    }

    // Inject Soniq AI Agent
    activeMembers.push({
      _id: "soniq-ai",
      username: "soniq",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Soniq&backgroundColor=b6e3f4,c0aede,d1d4f9",
      role: "ai-agent"
    });

    return activeMembers;
  };

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

      const isGuest = userId.startsWith("guest_");

      // Update room member count in DB (only for registered users!)
      if (!isGuest && /^[0-9a-fA-F]{24}$/.test(userId)) {
        const memberExists = room.members.some(m => m.toString() === userId.toString());
        if (!memberExists) {
          room.members.push(userId as any);
        }
      }
      // Always sync listener count to unique socket connections
      room.listenerCount = roomSocketMap.get(roomId)?.size || 0;
      await room.save();

      // Notify others in room
      socket.to(roomId).emit("room:member-joined", {
        userId,
        listenerCount: room.listenerCount
      });

      // Broadcast updated members list to all in room
      const activeMembers = await getActiveMembers(roomId, room);
      io.to(roomId).emit("room:members", {
        members: activeMembers,
        listenerCount: room.listenerCount
      });

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

      // Send room data to client with player state (including serverTimeAtEmit for Layer 4)
      const now = Date.now();
      socket.emit("room:joined", {
        room: room.toObject(),
        listenerCount: room.listenerCount,
        serverTimeAtEmit: now,
        playerState: {
          isPlaying: room.playerState?.isPlaying || false,
          currentTime,
          volume: room.playerState?.volume || 80,
          shuffle: room.playerState?.shuffle || false,
          repeatMode: room.playerState?.repeatMode || 'none'
        }
      });

      logger.info(`User ${userId} joined room ${roomId}`);
      
      // Update Listen History (registered users only)
      if (socket.handshake.auth?.userId && !isGuest) {
          try {
              await HistoryModel.findOneAndUpdate(
                  { user: userId, room: roomId },
                  { lastListened: new Date() },
                  { upsert: true, new: true }
              );
          } catch (historyError) {
              logger.error("Failed to update listen history:", historyError);
          }
      }
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

      const isGuest = userId.startsWith("guest_");

      // Update room member count
      const room = await RoomModel.findById(roomId);
      if (room) {
        if (!isGuest && /^[0-9a-fA-F]{24}$/.test(userId)) {
          room.members = room.members.filter((m: any) => m.toString() !== userId);
        }
        room.listenerCount = roomSockets?.size || 0;
        await room.save();

        // Notify others in room
        socket.to(roomId).emit("room:member-left", {
          userId,
          listenerCount: room.listenerCount
        });

        // Broadcast updated members list to all in room
        const activeMembers = await getActiveMembers(roomId, room);
        io.to(roomId).emit("room:members", {
          members: activeMembers,
          listenerCount: room.listenerCount
        });
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
      const room = await RoomModel.findById(roomId);

      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }
      
      const activeMembers = await getActiveMembers(roomId, room);

      socket.emit("room:members", {
        members: activeMembers,
        listenerCount: room.listenerCount
      });
    } catch (error) {
      logger.error("Error in room:get-members:", error);
      socket.emit("room:error", { message: "Failed to get members" });
    }
  });
  
  // Update Role (Promote/Demote)
  socket.on("room:update-role", async (data: { roomId: string, targetUserId: string, newRole: "dj" | "listener" }) => {
      try {
          const { roomId, targetUserId, newRole } = data;
          const requesterId = (socket.handshake.auth?.userId as string);

          if (requesterId.startsWith("guest_")) {
              socket.emit("room:error", { message: "Guests cannot update roles" });
              return;
          }
          
          const room = await RoomModel.findById(roomId);
          if (!room) return;
          
          // Verify requester is Host
          if (room.hostId.toString() !== requesterId) {
              socket.emit("room:error", { message: "Only the host can update roles" });
              return;
          }
          
          if (targetUserId === room.hostId.toString()) {
              socket.emit("room:error", { message: "Cannot change host role" });
              return;
          }
          
          // Update role directly in the Map
          if (newRole === "listener") {
              room.roles.delete(targetUserId);
          } else {
              room.roles.set(targetUserId, newRole);
          }
          
          await room.save();
          
          // Broadcast update
          const activeMembers = await getActiveMembers(roomId, room);
          io.to(roomId).emit("room:members", {
              members: activeMembers,
              listenerCount: room.listenerCount
          });
          
          io.to(roomId).emit("room:notification", {
              message: `Role updated for user`,
              type: "info"
          });
      } catch (error) {
          logger.error("Error in room:update-role:", error);
      }
  });
  
  // Kick Member
  socket.on("room:kick-member", async (data: { roomId: string, targetUserId: string }) => {
      try {
          const { roomId, targetUserId } = data;
          const requesterId = (socket.handshake.auth?.userId as string);

          if (requesterId.startsWith("guest_")) {
              socket.emit("room:error", { message: "Guests cannot kick members" });
              return;
          }
          
          const room = await RoomModel.findById(roomId);
          if (!room) return;
          
          if (room.hostId.toString() !== requesterId) {
              socket.emit("room:error", { message: "Only the host can kick members" });
              return;
          }
          
          if (targetUserId === room.hostId.toString()) return;

          // Remove member
          const isTargetGuest = targetUserId.startsWith("guest_");
          if (!isTargetGuest && /^[0-9a-fA-F]{24}$/.test(targetUserId)) {
              room.members = room.members.filter(m => m.toString() !== targetUserId);
          }
          room.roles.delete(targetUserId);
          
          // Find target socket to force leave
          const roomSockets = roomSocketMap.get(roomId);
          if (roomSockets) {
               const targetSocketId = userSocketMap.get(targetUserId);
               if (targetSocketId) {
                   const targetSocket = io.sockets.sockets.get(targetSocketId);
                   if (targetSocket) {
                       targetSocket.leave(roomId);
                       roomSockets.delete(targetSocketId);
                       targetSocket.emit("room:kicked", { message: "You have been kicked from the room" });
                   }
               }
          }
          
          room.listenerCount = roomSockets?.size || 0;
          await room.save();
          
          // Broadcast update
          const activeMembers = await getActiveMembers(roomId, room);
          io.to(roomId).emit("room:members", {
              members: activeMembers,
              listenerCount: room.listenerCount
          });
          
      } catch (error) {
          logger.error("Error in room:kick-member:", error);
      }
  });
}
