import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { handleRoomEvents } from "./handlers/room.handler.js";
import { handleChatEvents } from "./handlers/chat.handler.js";
import { handlePlayerEvents } from "./handlers/player.handler.js";
import { logger } from "../utils/logger.js";
import { redisClient } from "../config/redis.js";
import { createAdapter } from "@socket.io/redis-adapter";

const userSocketMap = new Map<string, string>(); // userId -> socketId
const roomSocketMap = new Map<string, Set<string>>(); // roomId -> Set of socketIds

export function initializeSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Use Redis adapter for scaling (optional)
  if (process.env.REDIS_URL) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Extract user info from handshake (set by auth middleware)
    const userId = (socket.handshake.auth?.userId as string) || socket.id;
    userSocketMap.set(userId, socket.id);

    // Register socket handlers
    handleRoomEvents(io, socket, userSocketMap, roomSocketMap);
    handleChatEvents(io, socket, userSocketMap, roomSocketMap);
    handlePlayerEvents(io, socket, userSocketMap, roomSocketMap);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
      userSocketMap.delete(userId);
      
      // Remove from all rooms
      roomSocketMap.forEach((socketIds, roomId) => {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          roomSocketMap.delete(roomId);
        }
      });
    });

    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}

export { userSocketMap, roomSocketMap };

