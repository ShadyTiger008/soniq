import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { RoomModel } from "../../models/room.model.js";

export function handleRoomEvents(
  io: SocketIOServer,
  socket: Socket,
  userSocketMap: Map<string, string>,
  roomSocketMap: Map<string, Set<string>>
) {
  // Helper to enrich members with roles
  const getMembersWithRoles = (room: any) => {
    return room.members.map((member: any) => {
      const memberObj = member.toObject ? member.toObject() : member;
      const memberId = memberObj._id.toString();
      
      let role = "listener";
      if (room.hostId.toString() === memberId) {
        role = "host";
      } else if (room.roles && room.roles.get(memberId)) {
        role = room.roles.get(memberId);
      }

      return {
        ...memberObj,
        role
      };
    });
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

      // Update room member count
      const memberExists = room.members.some(m => m.toString() === userId.toString());
      if (!memberExists) {
        room.members.push(userId as any);
      }
      // Always sync listener count to unique members length
      room.listenerCount = room.members.length;
      await room.save();

      // Notify others in room
      socket.to(roomId).emit("room:member-joined", {
        userId,
        listenerCount: room.listenerCount
      });

      // Broadcast updated members list to all in room
      const updatedRoom = await RoomModel.findById(roomId)
        .populate("members", "username email avatar")
        .lean(); // .lean() converts to POJO, but we need manual role attachment since roles is a Map in Mongoose doc
      
      if (updatedRoom) {
         // Re-fetch to get the Map properly if needed, or just use the raw doc structure
         // Mongoose .lean() with Map might be tricky, let's stick to manual helper above
         // But `roles` is in the DB. `updatedRoom.roles` should be available.
         
         // Actually, updatedRoom from .lean() will have roles as object/map.
         // Let's ensure we look at the right Host ID and Roles
         
         // We must reconstruct the proper structure manually because .lean() simplifies it
         // But our `getMembersWithRoles` expects the document structure somewhat.
         // Let's adapt it inline for clarity or fetch properly.
         
         // Fix: Fetch document to use our helper properly? 
         // Performance wise, we can just use the POJO.
         const membersWithRoles = updatedRoom.members.map((m: any) => {
             const mId = m._id.toString();
             let r = "listener";
             if (updatedRoom.hostId.toString() === mId) r = "host";
             else if (updatedRoom.roles && (updatedRoom.roles as any)[mId]) r = (updatedRoom.roles as any)[mId];
             
             return { ...m, role: r };
         });

        io.to(roomId).emit("room:members", {
          members: membersWithRoles,
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
        room.listenerCount = room.members.length;
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
            const membersWithRoles = updatedRoom.members.map((m: any) => {
                 const mId = m._id.toString();
                 let r = "listener";
                 if (updatedRoom.hostId.toString() === mId) r = "host";
                 else if (updatedRoom.roles && (updatedRoom.roles as any)[mId]) r = (updatedRoom.roles as any)[mId];
                 return { ...m, role: r };
            });

          io.to(roomId).emit("room:members", {
            members: membersWithRoles,
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
      ).lean();

      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }
      
      const membersWithRoles = room.members.map((m: any) => {
             const mId = m._id.toString();
             let r = "listener";
             if (room.hostId.toString() === mId) r = "host";
             else if (room.roles && (room.roles as any)[mId]) r = (room.roles as any)[mId];
             return { ...m, role: r };
      });

      socket.emit("room:members", {
        members: membersWithRoles,
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
          const updatedRoom = await RoomModel.findById(roomId)
            .populate("members", "username email avatar")
            .lean();
            
          if (updatedRoom) {
             const membersWithRoles = updatedRoom.members.map((m: any) => {
                 const mId = m._id.toString();
                 let r = "listener";
                 if (updatedRoom.hostId.toString() === mId) r = "host";
                 else if (updatedRoom.roles && (updatedRoom.roles as any)[mId]) r = (updatedRoom.roles as any)[mId];
                 return { ...m, role: r };
            });
            
            io.to(roomId).emit("room:members", {
                members: membersWithRoles,
                listenerCount: updatedRoom.listenerCount
            });
            
            // Notify target specifically? 
            // Or just generic toast via members update?
            // The room:members broadcast covers the list update.
            // Client side logic can detect role change if needed, or we emit specific.
            io.to(roomId).emit("room:notification", {
                message: `Role updated for user`,
                type: "info"
            });
          }
      } catch (error) {
          logger.error("Error in room:update-role:", error);
      }
  });
  
  // Kick Member
  socket.on("room:kick-member", async (data: { roomId: string, targetUserId: string }) => {
      try {
          const { roomId, targetUserId } = data;
          const requesterId = (socket.handshake.auth?.userId as string);
          
          const room = await RoomModel.findById(roomId);
          if (!room) return;
          
          if (room.hostId.toString() !== requesterId) {
              socket.emit("room:error", { message: "Only the host can kick members" });
              return;
          }
          
          if (targetUserId === room.hostId.toString()) return;

          // Remove member
          room.members = room.members.filter(m => m.toString() !== targetUserId);
          room.roles.delete(targetUserId);
          room.listenerCount = Math.max(0, room.members.length);
          
          await room.save();
          
          // Find target socket to force leave
          const roomSockets = roomSocketMap.get(roomId);
          if (roomSockets) {
               // This is tricky without a user->socket map for ALL users. 
               // We passed userSocketMap in args? Yes.
               const targetSocketId = userSocketMap.get(targetUserId);
               if (targetSocketId) {
                   const targetSocket = io.sockets.sockets.get(targetSocketId);
                   if (targetSocket) {
                       targetSocket.leave(roomId);
                       targetSocket.emit("room:kicked", { message: "You have been kicked from the room" });
                   }
               }
          }
          
          // Broadcast update
          const updatedRoom = await RoomModel.findById(roomId)
            .populate("members", "username email avatar")
            .lean();
            
          if (updatedRoom) {
             const membersWithRoles = updatedRoom.members.map((m: any) => {
                 const mId = m._id.toString();
                 let r = "listener";
                 if (updatedRoom.hostId.toString() === mId) r = "host";
                 else if (updatedRoom.roles && (updatedRoom.roles as any)[mId]) r = (updatedRoom.roles as any)[mId];
                 return { ...m, role: r };
            });
            
            io.to(roomId).emit("room:members", {
                members: membersWithRoles,
                listenerCount: updatedRoom.listenerCount
            });
          }
          
      } catch (error) {
          logger.error("Error in room:kick-member:", error);
      }
  });
}
