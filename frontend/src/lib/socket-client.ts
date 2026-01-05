"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-context";
import { SOCKET_URL } from "@frontend/config/api.config";

import type { ChatMessage } from "@frontend/types";

export interface SocketPlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
}



export interface QueueUpdate {
  queue: Array<{
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
    requestedBy?: any;
  }>;
}

export interface SongChange {
  currentSong?: {
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
    requestedBy?: any;
  };
  queue?: Array<{
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
    requestedBy?: any;
  }>;
  playerState?: SocketPlayerState;
}

export function useSocket(roomId: string | null) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerState, setPlayerState] = useState<SocketPlayerState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [listenerCount, setListenerCount] = useState(0);
  const [queueUpdate, setQueueUpdate] = useState<QueueUpdate | null>(null);
  const [songChange, setSongChange] = useState<SongChange | null>(null);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !roomId) {
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("soniq_token");
    if (!token) {
      return;
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        userId: user._id || user.id,
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", newSocket.id);

      // Join room
      if (roomId) {
        newSocket.emit("room:join", { roomId });
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Room events
    newSocket.on(
      "room:joined",
      (data: {
        room: any;
        listenerCount: number;
        playerState?: SocketPlayerState;
      }) => {
        console.log("Room joined:", data);
        setListenerCount(data.listenerCount);
        if (data.playerState) {
          // Set initial player state when joining
          setPlayerState({
            isPlaying: data.playerState.isPlaying,
            currentTime: data.playerState.currentTime,
            volume: data.playerState.volume,
            shuffle: data.playerState.shuffle,
            repeatMode: data.playerState.repeatMode,
          });
        }
        // Request full player state (includes current song and queue)
        newSocket.emit("player:get-state", { roomId });
        // Request chat history
        newSocket.emit("chat:get-history", { roomId, limit: 50 });
        // Request room members
        newSocket.emit("room:get-members", { roomId });
      }
    );

    newSocket.on(
      "room:member-joined",
      (data: { listenerCount: number; userId?: string }) => {
        setListenerCount(data.listenerCount);
        // Request updated members list
        if (roomId) {
          newSocket.emit("room:get-members", { roomId });
        }
      }
    );

    newSocket.on(
      "room:member-left",
      (data: { listenerCount: number; userId?: string }) => {
        setListenerCount(data.listenerCount);
        // Request updated members list
        if (roomId) {
          newSocket.emit("room:get-members", { roomId });
        }
      }
    );

    // Room members list
    newSocket.on(
      "room:members",
      (data: { members: any[]; listenerCount: number }) => {
        setRoomMembers(data.members || []);
        setListenerCount(data.listenerCount);
      }
    );

    newSocket.on("room:error", (error: { message: string }) => {
      console.error("Room error:", error);
    });

    // Player events
    newSocket.on(
      "player:state",
      (data: {
        currentSong?: any;
        queue?: any[];
        playerState?: SocketPlayerState;
      }) => {
        console.log("Player state received:", data);
        if (data.playerState) {
          // Set complete player state including calculated current time
          // This is the initial state when joining a room
          setPlayerState({
            isPlaying: data.playerState.isPlaying,
            currentTime: data.playerState.currentTime,
            volume: data.playerState.volume,
            shuffle: data.playerState.shuffle,
            repeatMode: data.playerState.repeatMode,
          });
        }
        // Also trigger song change if currentSong is provided
        if (data.currentSong) {
          setSongChange({
            currentSong: data.currentSong,
            queue: data.queue,
            playerState: data.playerState,
          });
        }
        // Trigger queue update if queue is provided
        if (data.queue) {
          setQueueUpdate({ queue: data.queue });
        }
      }
    );

    newSocket.on(
      "player:state-changed",
      (data: {
        isPlaying: boolean;
        currentTime?: number;
        timestamp: number;
      }) => {
        setPlayerState((prev) => {
          const newState = {
            isPlaying: data.isPlaying,
            currentTime: data.currentTime ?? prev?.currentTime ?? 0,
            volume: prev?.volume ?? 80,
            shuffle: prev?.shuffle ?? false,
            repeatMode: prev?.repeatMode ?? 'none',
          };
          return newState;
        });
      }
    );

    newSocket.on(
      "player:seeked",
      (data: { time: number; timestamp: number }) => {
        setPlayerState((prev) => ({
          ...prev!,
          currentTime: data.time,
        }));
      }
    );

    newSocket.on(
      "player:volume-changed",
      (data: { volume: number; timestamp: number }) => {
        setPlayerState((prev) => ({
          ...prev!,
          volume: data.volume,
        }));
      }
    );

    newSocket.on(
      "player:song-changed",
      (data: {
        currentSong?: any;
        queue?: any[];
        playerState?: SocketPlayerState;
      }) => {
        setSongChange(data);
        if (data.playerState) {
          setPlayerState(data.playerState);
        }
      }
    );

    newSocket.on("player:queue-updated", (data: { queue: any[] }) => {
      setQueueUpdate({ queue: data.queue });
    });

    newSocket.on(
      "player:time-updated",
      (data: { currentTime: number; timestamp: number }) => {
        // Update time from socket - always use socket time to prevent glitching
        setPlayerState((prev) => ({
          ...prev!,
          currentTime: data.currentTime,
          // Keep existing isPlaying and volume
          isPlaying: prev?.isPlaying ?? false,
          volume: prev?.volume ?? 80,
          shuffle: prev?.shuffle ?? false,
          repeatMode: prev?.repeatMode ?? 'none',
        }));
      }
    );

    newSocket.on("player:shuffle-changed", (data: { shuffle: boolean }) => {
      setPlayerState((prev) => ({
        ...prev!,
        shuffle: data.shuffle,
      }));
    });

    newSocket.on("player:repeat-changed", (data: { repeatMode: 'none' | 'one' | 'all' }) => {
      setPlayerState((prev) => ({
        ...prev!,
        repeatMode: data.repeatMode,
      }));
    });

    newSocket.on("player:error", (error: { message: string }) => {
      console.error("Player error:", error);
    });

    // Chat events
    newSocket.on("chat:new-message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    newSocket.on("chat:history", (data: { messages: ChatMessage[] }) => {
      setChatMessages(data.messages);
    });

    newSocket.on(
      "chat:reaction-added",
      (data: {
        messageId: string;
        emoji: string;
        userId: string;
        removed?: boolean;
      }) => {
        // Update message reactions
        setChatMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              // Handle reaction updates (simplified)
              return msg;
            }
            return msg;
          })
        );
      }
    );

    newSocket.on("chat:error", (error: { message: string }) => {
      console.error("Chat error:", error);
    });

    // Cleanup
    return () => {
      if (roomId) {
        newSocket.emit("room:leave", { roomId });
      }
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, isAuthenticated, user]);

  // Emit functions
  const emitPlayerPlayPause = (isPlaying: boolean, currentTime?: number) => {
    if (socket && roomId && user) {
      socket.emit("player:play-pause", {
        roomId,
        isPlaying,
        currentTime,
        userId: user._id || user.id,
      });
    }
  };

  const emitPlayerSeek = (time: number) => {
    if (socket && roomId && user) {
      socket.emit("player:seek", {
        roomId,
        time,
        userId: user._id || user.id,
      });
    }
  };

  const emitPlayerVolume = (volume: number) => {
    if (socket && roomId && user) {
      socket.emit("player:volume", {
        roomId,
        volume,
        userId: user._id || user.id,
      });
    }
  };

  const emitPlayerSkip = (direction: "next" | "prev") => {
    if (socket && roomId && user) {
      socket.emit("player:skip", {
        roomId,
        direction,
        userId: user._id || user.id,
      });
    }
  };

  const emitPlayerShuffle = (shuffle: boolean) => {
    if (socket && roomId && user) {
      socket.emit("player:shuffle", {
        roomId,
        shuffle,
        userId: user._id || user.id,
      });
    }
  };

  const emitPlayerRepeat = (repeatMode: 'none' | 'one' | 'all') => {
    if (socket && roomId && user) {
      socket.emit("player:repeat", {
        roomId,
        repeatMode,
        userId: user._id || user.id,
      });
    }
  };

  const emitAddToQueue = (
    song: {
      videoId: string;
      title: string;
      artist: string;
      duration: number;
      thumbnail?: string;
    },
    playNow = false
  ) => {
    if (socket && roomId && user) {
      socket.emit("player:add-to-queue", {
        roomId,
        song,
        userId: user._id || user.id,
        playNow,
      });
    }
  };

  const emitUpdateTime = (currentTime: number) => {
    if (socket && roomId && user) {
      socket.emit("player:update-time", {
        roomId,
        currentTime,
        userId: user._id || user.id,
      });
    }
  };

  const emitChatMessage = (message: string) => {
    if (socket && roomId && user) {
      socket.emit("chat:message", {
        roomId,
        message,
        userId: user._id || user.id,
        username: user.username || "Unknown",
        avatar: user.avatar,
      });
    }
  };

  const emitChatReaction = (messageId: string, emoji: string) => {
    if (socket && roomId && user) {
      socket.emit("chat:reaction", {
        roomId,
        messageId,
        emoji,
        userId: user._id || user.id,
      });
    }
  };

  const emitChatTyping = (isTyping: boolean) => {
    if (socket && roomId && user) {
      socket.emit("chat:typing", {
        roomId,
        userId: user._id || user.id,
        username: user.username || "Unknown",
        isTyping,
      });
    }
  };

  const emitReorderQueue = (fromIndex: number, toIndex: number) => {
    if (socket && roomId && user) {
      socket.emit("player:reorder-queue", {
        roomId,
        fromIndex,
        toIndex,
        userId: user._id || user.id,
      });
    }
  };

  const emitRemoveFromQueue = (videoId: string) => {
    if (socket && roomId && user) {
        socket.emit("player:remove-from-queue", {
            roomId,
            videoId,
            userId: user._id || user.id,
        });
    }
  };

  const emitPlayQueueItem = (videoId: string) => {
      if (socket && roomId && user) {
          socket.emit("player:play-queue-item", {
              roomId,
              videoId,
              userId: user._id || user.id,
          });
      }
  };

  return {
    socket,
    isConnected,
    playerState,
    chatMessages,
    listenerCount,
    queueUpdate,
    songChange,
    roomMembers,
    emitPlayerPlayPause,
    emitPlayerSeek,
    emitPlayerVolume,
    emitPlayerSkip,
    emitPlayerShuffle,
    emitPlayerRepeat,
    emitAddToQueue,
    emitUpdateTime,
    emitChatMessage,
    emitChatReaction,
    emitChatTyping,
    emitReorderQueue,
    emitRemoveFromQueue,
    emitPlayQueueItem,
  };
}
