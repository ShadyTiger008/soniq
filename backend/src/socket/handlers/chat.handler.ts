import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger.js";
import { ChatMessageModel } from "../../models/chat.model.js";
import { UserModel } from "../../models/user.model.js";
import { RoomModel } from "../../models/room.model.js";
import { geminiService } from "../../services/gemini.service.js";
import { youtubeService } from "../../services/youtube.service.js";
import mongoose from "mongoose";

const SONIQ_ID = "soniq-ai";
const SONIQ_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Soniq&backgroundColor=b6e3f4,c0aede,d1d4f9";

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

        if (userId && userId.startsWith("guest_")) {
          socket.emit("chat:error", { message: "Guests cannot send chat messages" });
          return;
        }

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

        // Handle Mentions and Commands
        if (message.startsWith(".")) {
          await handleSoniqCommand(io, roomId, message, userId, username);
        } else if (message.includes("@soniq")) {
          await handleSoniqMention(io, roomId, message, userId, username);
        } else {
          // Regular mentions
          const mentions = message.match(/@(\w+)/g);
          if (mentions) {
            const usernames = mentions.map(m => m.substring(1));
            const mentionedUsers = await UserModel.find({ 
              username: { $in: usernames } 
            }, '_id username');

            for (const mentionedUser of mentionedUsers) {
              if (mentionedUser._id.toString() !== userId) {
                io.to(mentionedUser._id.toString()).emit("chat:mention", {
                  roomId,
                  messageId: chatMessage._id.toString(),
                  senderName: username,
                  message: message.trim()
                });
              }
            }
          }
        }

        logger.info(`Chat message in room ${roomId} from ${username}`);
      } catch (error) {
        logger.error("Error in chat:message:", error);
        socket.emit("chat:error", { message: "Failed to send message" });
      }
    }
  );

  async function sendSoniqMessage(io: SocketIOServer, roomId: string, message: string) {
    const chatMessage = await ChatMessageModel.create({
      roomId: new mongoose.Types.ObjectId(roomId),
      userId: new mongoose.Types.ObjectId("000000000000000000000000"), // Virtual ID
      username: "soniq",
      avatar: SONIQ_AVATAR,
      message: message.trim()
    });

    const messageData = {
      id: chatMessage._id.toString(),
      userId: SONIQ_ID,
      username: "soniq",
      avatar: SONIQ_AVATAR,
      message: chatMessage.message,
      timestamp: chatMessage.createdAt.toISOString(),
      roomId: chatMessage.roomId.toString(),
      role: "admin",
      status: message.endsWith("...") ? "pending" : "done"
    };

    io.to(roomId).emit("chat:new-message", messageData);
  }

  async function handleSoniqCommand(
    io: SocketIOServer,
    roomId: string,
    message: string,
    userId: string,
    username: string
  ) {
    const command = message.split(" ")[0].substring(1).toLowerCase();
    const args = message.split(" ").slice(1).join(" ");

    switch (command) {
      case "help":
        await sendSoniqMessage(io, roomId, 
          `Hey @${username}! I'm **Soniq**, your AI Music Agent. 🎵\n\n` +
          `**Commands:**\n` +
          `• \`.play <song/mood>\` - Play or search music\n` +
          `• \`.pause\` - Pause current playback\n` +
          `• \`.skip\` - Skip to next song\n` +
          `• \`.clear\` - Clear the queue\n` +
          `• \`.help\` - Show this help message\n\n` +
          `**Mentions:**\n` +
          `Mention me like "@soniq I'm feeling hype" and I'll curate a playlist for you!`
        );
        break;

      case "play":
        if (args) {
          await handleSoniqMention(io, roomId, args, userId, username);
        } else {
          io.to(roomId).emit("player:play-pause", { roomId, userId, username });
        }
        break;

      case "pause":
        io.to(roomId).emit("player:play-pause", { roomId, userId, username });
        break;

      case "skip":
        io.to(roomId).emit("player:skip", { roomId, userId, username });
        break;

      case "clear":
        try {
          const room = await RoomModel.findById(roomId);
          if (room) {
            room.queue = [];
            await room.save();
            io.to(roomId).emit("player:queue-updated", { queue: [] });
            await sendSoniqMessage(io, roomId, `Queue cleared by @${username} 🧹`);
          }
        } catch (error) {
          logger.error("Error clearing queue via Soniq:", error);
        }
        break;

      default:
        // Ignore unknown commands
        break;
    }
  }

  async function handleSoniqMention(
    io: SocketIOServer,
    roomId: string,
    message: string,
    userId: string,
    username: string
  ) {
    try {
      // Remove @soniq from message
      const prompt = message.replace("@soniq", "").trim();
      
      if (!prompt) {
        await sendSoniqMessage(io, roomId, `Yes @${username}? How can I help you with your vibe today?`);
        return;
      }

      // Notify typing start
      io.to(roomId).emit("chat:typing", { roomId, userId: SONIQ_ID, username: "soniq", isTyping: true });

      await sendSoniqMessage(io, roomId, `Analyzing the vibe for @${username}... 🧠✨`);

      let searchQueries: string[] = [];
      let detectedMood = "custom";

      try {
        // Use Gemini to analyze the prompt
        const analysis = await geminiService.analyzeVibe({
          vibe: prompt,
          experienceType: "playlist",
          length: 3
        });
        searchQueries = analysis.searchQueries;
        detectedMood = analysis.mood;
        await sendSoniqMessage(io, roomId, `Found some **${detectedMood}** tracks for you! Curating... 🎧`);
      } catch (geminiError) {
        logger.warn("Gemini analysis failed, falling back to direct search:", geminiError);
        // Fallback: Use the prompt directly as the search query
        searchQueries = [prompt];
        await sendSoniqMessage(io, roomId, `My AI brain is a bit busy, but I'll search for your vibe directly! 🔎🎵`);
      }

      const tracksToAdd: any[] = [];
      for (const query of searchQueries.slice(0, 3)) {
        const results = await youtubeService.searchMusic(query, 1);
        if (results && results.length > 0) {
          tracksToAdd.push({
            ...results[0],
            requestedBy: username, // Set to username for UI
            requestedById: userId  // Set to actual userId
          });
        }
      }

      if (tracksToAdd.length > 0) {
        const room = await RoomModel.findById(roomId);
        if (room) {
          room.queue.push(...tracksToAdd);
          
          // If nothing is playing, start the first one
          if (!room.currentSong?.videoId) {
            const nextSong = room.queue.shift();
            if (nextSong) {
              room.currentSong = {
                videoId: nextSong.videoId,
                title: nextSong.title,
                artist: nextSong.artist,
                duration: nextSong.duration,
                thumbnail: nextSong.thumbnail
              };
              room.playerState = {
                ...room.playerState,
                isPlaying: true,
                currentTime: 0,
                lastUpdated: new Date(),
                volume: room.playerState?.volume ?? 80,
                shuffle: room.playerState?.shuffle ?? false,
                repeatMode: room.playerState?.repeatMode ?? 'none'
              };
            }
          }
          
          await room.save();
          
          // Broadcast updates
          io.to(roomId).emit("player:queue-updated", { queue: room.queue });
          if (room.currentSong) {
            io.to(roomId).emit("player:song-changed", {
              song: room.currentSong,
              playerState: room.playerState
            });
          }

          await sendSoniqMessage(io, roomId, `Added ${tracksToAdd.length} tracks to the queue. Enjoy the session! 🎵🔥`);
        }
      } else {
        await sendSoniqMessage(io, roomId, `Sorry @${username}, I couldn't find any music for that prompt. Try something else?`);
      }
    } catch (error) {
      logger.error("Error in Soniq mention handling:", error);
      await sendSoniqMessage(io, roomId, `Oops, something went wrong while curating your music. Please try again!`);
    } finally {
      // Notify typing end
      io.to(roomId).emit("chat:typing", { roomId, userId: SONIQ_ID, username: "soniq", isTyping: false });
    }
  }

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

        if (userId && userId.startsWith("guest_")) {
          socket.emit("chat:error", { message: "Guests cannot add reactions" });
          return;
        }

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
        if (userId && userId.startsWith("guest_")) {
          return;
        }
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
