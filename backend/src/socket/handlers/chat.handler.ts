import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { ChatMessageModel } from "../../models/chat.model.js";
import mongoose from "mongoose";

export function handleChatEvents(
  io: SocketIOServer,
  socket: Socket
) {
  // Send message
  socket.on(
    "chat:message",
    async (data: {
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

        // Store message in database
        const chatMessage = await ChatMessageModel.create({
          roomId: new mongoose.Types.ObjectId(roomId),
          userId: new mongoose.Types.ObjectId(userId),
          username,
          avatar: avatar || "",
          message: message.trim()
        });

        const messageData = {
          id: chatMessage._id.toString(),
          userId: chatMessage.userId.toString(),
          username: chatMessage.username,
          avatar: chatMessage.avatar || "🎵",
          message: chatMessage.message,
          timestamp: chatMessage.createdAt.toISOString(),
          roomId: chatMessage.roomId.toString()
        };

        // Broadcast to room
        io.to(roomId).emit("chat:new-message", messageData);

        logger.info(`Chat message in room ${roomId} from ${username}`);
      } catch (error) {
        logger.error("Error in chat:message:", error);
        socket.emit("chat:error", { message: "Failed to send message" });
      }
    }
  );

  // Get chat history
  socket.on(
    "chat:get-history",
    async (data: { roomId: string; limit?: number }) => {
      try {
        const { roomId, limit = 50 } = data;

        const messages = await ChatMessageModel.find({
          roomId: new mongoose.Types.ObjectId(roomId)
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("userId", "username avatar")
          .lean();

        const messageData = messages.reverse().map((msg: any) => ({
          id: msg._id.toString(),
          userId: msg.userId?._id 
            ? msg.userId._id.toString() 
            : (msg.userId ? msg.userId.toString() : null),
          username: msg.username,
          avatar: msg.avatar || "🎵",
          message: msg.message,
          timestamp: msg.createdAt.toISOString(),
          roomId: msg.roomId.toString()
        }));

        socket.emit("chat:history", { messages: messageData });
      } catch (error) {
        logger.error("Error in chat:get-history:", error);
        socket.emit("chat:error", { message: "Failed to get chat history" });
      }
    }
  );

  // Add reaction to message
  socket.on(
    "chat:reaction",
    async (data: {
      roomId: string;
      messageId: string;
      emoji: string;
      userId: string;
    }) => {
      try {
        const { roomId, messageId, emoji, userId } = data;

        const message = await ChatMessageModel.findById(messageId);
        if (!message) {
          socket.emit("chat:error", { message: "Message not found" });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions?.find(
          (r) => r.emoji === emoji && r.userId.toString() === userId
        );

        if (existingReaction) {
          // Remove reaction
          message.reactions = message.reactions?.filter(
            (r) => !(r.emoji === emoji && r.userId.toString() === userId)
          );
        } else {
          // Add reaction
          if (!message.reactions) {
            message.reactions = [];
          }
          message.reactions.push({
            emoji,
            userId: new mongoose.Types.ObjectId(userId)
          });
        }

        await message.save();

        io.to(roomId).emit("chat:reaction-added", {
          messageId,
          emoji,
          userId,
          removed: !!existingReaction
        });
      } catch (error) {
        logger.error("Error in chat:reaction:", error);
        socket.emit("chat:error", { message: "Failed to add reaction" });
      }
    }
  );

  // Typing indicator
  socket.on(
    "chat:typing",
    (data: {
      roomId: string;
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      try {
        const { roomId, userId, username, isTyping } = data;
        socket.to(roomId).emit("chat:typing", {
          userId,
          username,
          isTyping
        });
      } catch (error) {
        logger.error("Error in chat:typing:", error);
      }
    }
  );
}
