import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";

export function handleChatEvents(
  io: SocketIOServer,
  socket: Socket,
  userSocketMap: Map<string, string>,
  roomSocketMap: Map<string, Set<string>>
) {
  // Send message
  socket.on("chat:message", (data: {
    roomId: string;
    message: string;
    userId: string;
    username: string;
    avatar?: string;
  }) => {
    try {
      const { roomId, message, userId, username, avatar } = data;

      if (!message.trim()) {
        socket.emit("chat:error", { message: "Message cannot be empty" });
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        userId,
        username,
        avatar: avatar || "🎵",
        message: message.trim(),
        timestamp: new Date().toISOString(),
        roomId,
      };

      // Broadcast to room
      io.to(roomId).emit("chat:new-message", messageData);

      logger.info(`Chat message in room ${roomId} from ${username}`);
    } catch (error) {
      logger.error("Error in chat:message:", error);
      socket.emit("chat:error", { message: "Failed to send message" });
    }
  });

  // Add reaction to message
  socket.on("chat:reaction", (data: {
    roomId: string;
    messageId: string;
    emoji: string;
    userId: string;
  }) => {
    try {
      const { roomId, messageId, emoji, userId } = data;

      io.to(roomId).emit("chat:reaction-added", {
        messageId,
        emoji,
        userId,
      });
    } catch (error) {
      logger.error("Error in chat:reaction:", error);
    }
  });

  // Typing indicator
  socket.on("chat:typing", (data: { roomId: string; userId: string; username: string; isTyping: boolean }) => {
    try {
      const { roomId, userId, username, isTyping } = data;
      socket.to(roomId).emit("chat:typing", {
        userId,
        username,
        isTyping,
      });
    } catch (error) {
      logger.error("Error in chat:typing:", error);
    }
  });
}

