import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { handleRoomEvents } from "./handlers/room.handler.js";
import { handleChatEvents } from "./handlers/chat.handler.js";
import { handlePlayerEvents } from "./handlers/player.handler.js";
import { logger } from "../utils/logger.js";
import { redisClient } from "../config/redis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import envConfig from "../config/index.js";

const userSocketMap = new Map<string, string>(); // userId -> socketId
const roomSocketMap = new Map<string, Set<string>>(); // roomId -> Set of socketIds

export function initializeSocketIO(server: HttpServer): SocketIOServer {
  const allowedOrigins = envConfig.cors.allowedOrigins;

  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (process.env.NODE_ENV === "development") {
          return callback(null, true);
        }

        if (!origin) {
          return callback(null, true);
        }

        // Normalize origin
        const normalizedOrigin = origin.replace(/\/$/, "").toLowerCase();

        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowedOrigin => {
          const normalizedAllowed = allowedOrigin.replace(/\/$/, "").toLowerCase();
          return (
            normalizedOrigin === normalizedAllowed ||
            normalizedOrigin.replace(/^www\./, "") === normalizedAllowed.replace(/^www\./, "")
          );
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.warn(`Socket.IO CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["polling", "websocket"],
    pingInterval: 10000,
    pingTimeout: 5000,
    perMessageDeflate: false,
    maxHttpBufferSize: 1e6,
  });

  // Use Redis adapter for scaling (optional)
  if (redisClient) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("📡 Socket.IO Redis adapter initialized");
  }

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Extract user info from handshake
    const auth = socket.handshake.auth || {};
    const userId = (auth.userId as string) || socket.id;
    const username = (auth.username as string) || `Guest-${socket.id.substring(0, 4).toUpperCase()}`;
    const avatar = (auth.avatar as string) || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
    const isGuest = !!auth.isGuest || userId.startsWith("guest_");

    socket.data.user = {
      _id: userId,
      username,
      avatar,
      isGuest,
      role: "listener"
    };

    userSocketMap.set(userId, socket.id);
    socket.join(userId); // Join user's personal room for direct notifications

    // Register socket handlers
    handleRoomEvents(io, socket, userSocketMap, roomSocketMap);
    handleChatEvents(io, socket);
    handlePlayerEvents(io, socket);

    socket.on("disconnect", async () => {
      logger.info(`Client disconnected: ${socket.id}`);
      userSocketMap.delete(userId);
      
      // Remove from all rooms and update DB
      for (const [roomId, socketIds] of roomSocketMap.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          const newSize = socketIds.size;
          if (newSize === 0) {
            roomSocketMap.delete(roomId);
          }

          try {
            const { RoomModel } = await import("../models/room.model.js");
            const room = await RoomModel.findById(roomId);
            if (room) {
              if (!isGuest && /^[0-9a-fA-F]{24}$/.test(userId)) {
                room.members = room.members.filter((m: any) => m.toString() !== userId);
              }
              room.listenerCount = newSize;
              await room.save();

              // Notify others in room
              io.to(roomId).emit("room:member-left", {
                userId,
                listenerCount: room.listenerCount
              });

              // Re-fetch and broadcast members
              const updatedRoom = await RoomModel.findById(roomId)
                .populate("members", "username email avatar")
                .lean();
              if (updatedRoom) {
                // Get active members from socketMap
                const activeMembers = [];
                for (const sid of socketIds) {
                  const socketInRoom = io.sockets.sockets.get(sid);
                  if (socketInRoom && socketInRoom.data.user) {
                    const userObj = { ...socketInRoom.data.user };
                    const memberId = userObj._id.toString();
                    
                    let role = "listener";
                    if (updatedRoom.hostId.toString() === memberId) {
                      role = "host";
                    } else if (updatedRoom.roles) {
                      const roleValue = (updatedRoom.roles as any)?.get 
                        ? (updatedRoom.roles as any).get(memberId) 
                        : (updatedRoom.roles as any)?.[memberId];
                      if (roleValue) role = roleValue;
                    }
                    userObj.role = role;
                    activeMembers.push(userObj);
                  }
                }
                
                // Inject Soniq AI
                activeMembers.push({
                  _id: "soniq-ai",
                  username: "soniq",
                  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Soniq&backgroundColor=b6e3f4,c0aede,d1d4f9",
                  role: "ai-agent"
                });

                io.to(roomId).emit("room:members", {
                  members: activeMembers,
                  listenerCount: room.listenerCount
                });
              }
            }
          } catch (dbError) {
            logger.error("Failed to update room on disconnect:", dbError);
          }
        }
      }
    });

    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}

export { userSocketMap, roomSocketMap };

