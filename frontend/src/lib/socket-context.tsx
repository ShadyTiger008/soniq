"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { SOCKET_URL } from "@frontend/config/api.config";
import { toast } from "sonner";
import type { ChatMessage, PlayerState } from "@frontend/types";

export interface SocketPlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  timestamp?: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  playerState: SocketPlayerState | null;
  chatMessages: ChatMessage[];
  listenerCount: number;
  roomMembers: any[];
  queueUpdate: any;
  songChange: any;
  emitPlayerPlayPause: (isPlaying: boolean, currentTime?: number) => void;
  emitPlayerSeek: (time: number) => void;
  emitPlayerVolume: (volume: number) => void;
  emitPlayerSkip: (direction: "next" | "prev") => void;
  emitPlayerShuffle: (shuffle: boolean) => void;
  emitPlayerRepeat: (repeatMode: 'none' | 'one' | 'all') => void;
  emitAddToQueue: (song: any, playNow?: boolean) => void;
  emitUpdateTime: (currentTime: number) => void;
  emitChatMessage: (message: string) => void;
  emitReorderQueue: (fromIndex: number, toIndex: number) => void;
  emitRemoveFromQueue: (videoId: string) => void;
  emitPlayQueueItem: (videoId: string) => void;
  emitRequestSong: (song: any) => void;
  emitApproveRequest: (videoId: string) => void;
  emitRejectRequest: (videoId: string) => void;
  emitUpdateRole: (targetUserId: string, newRole: "dj" | "listener") => void;
  emitKickMember: (targetUserId: string) => void;
  requestsUpdate: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ roomId, children }: { roomId: string | null; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerState, setPlayerState] = useState<SocketPlayerState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [listenerCount, setListenerCount] = useState(0);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [queueUpdate, setQueueUpdate] = useState<any>(null);
  const [requestsUpdate, setRequestsUpdate] = useState<any>(null);
  const [songChange, setSongChange] = useState<any>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !roomId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("soniq_token");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { userId: user._id || user.id, token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("room:join", { roomId });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
       console.log("Socket disconnected:", reason);
       setIsConnected(false);
    });
    
    newSocket.on("room:joined", (data) => {
      setListenerCount(data.listenerCount);
      if (data.playerState) setPlayerState({ ...data.playerState });
      newSocket.emit("player:get-state", { roomId });
      newSocket.emit("chat:get-history", { roomId, limit: 50 });
      newSocket.emit("room:get-members", { roomId });
    });

    newSocket.on("room:member-joined", (data) => {
        setListenerCount(data.listenerCount);
        newSocket.emit("room:get-members", { roomId });
    });

    newSocket.on("room:member-left", (data) => {
        setListenerCount(data.listenerCount);
        newSocket.emit("room:get-members", { roomId });
    });

    newSocket.on("room:members", (data) => {
      setRoomMembers(data.members || []);
      setListenerCount(data.listenerCount);
    });

    newSocket.on("player:state", (data) => {
      if (data.playerState) setPlayerState({ ...data.playerState });
      if (data.currentSong) setSongChange(data);
      if (data.queue) setQueueUpdate({ queue: data.queue });
      if (data.requests) setRequestsUpdate({ requests: data.requests });
    });

    newSocket.on("player:state-changed", (data) => {
      setPlayerState((prev) => ({
        isPlaying: data.isPlaying,
        currentTime: data.currentTime ?? prev?.currentTime ?? 0,
        volume: prev?.volume ?? 80,
        shuffle: prev?.shuffle ?? false,
        repeatMode: prev?.repeatMode ?? 'none',
        timestamp: data.timestamp
      }));
    });

    newSocket.on("player:seeked", (data) => {
      setPlayerState((prev) => prev ? ({ ...prev, currentTime: data.time }) : null);
    });

    newSocket.on("player:volume-changed", (data) => {
      setPlayerState((prev) => prev ? ({ ...prev, volume: data.volume }) : null);
    });

    newSocket.on("player:song-changed", (data) => {
      setSongChange(data);
      if (data.playerState) setPlayerState(data.playerState);
    });

    newSocket.on("player:queue-updated", (data) => setQueueUpdate({ queue: data.queue }));
    newSocket.on("player:requests-updated", (data) => setRequestsUpdate({ requests: data.requests }));

    newSocket.on("player:time-updated", (data) => {
      setPlayerState((prev) => prev ? ({
        ...prev,
        currentTime: data.currentTime,
        timestamp: data.timestamp
      }) : null);
    });

    newSocket.on("player:shuffle-changed", (data) => {
      setPlayerState((prev) => prev ? ({ ...prev, shuffle: data.shuffle }) : null);
    });

    newSocket.on("player:repeat-changed", (data) => {
      setPlayerState((prev) => prev ? ({ ...prev, repeatMode: data.repeatMode }) : null);
    });

    newSocket.on("chat:new-message", (msg) => setChatMessages((prev) => [...prev, msg]));
    newSocket.on("chat:history", (data) => setChatMessages(data.messages));
    
    newSocket.on("room:kicked", (data) => {
        window.location.href = "/home"; // Hard redirect or router push if available? Context doesn't have router.
        // We can use window.location as fallback.
    });

    newSocket.on("room:notification", (data) => {
        if (data.type === 'error') toast.error(data.message);
        else toast.info(data.message);
    });

    return () => {
      newSocket.emit("room:leave", { roomId });
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, isAuthenticated, user]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current && roomId && user) {
      socketRef.current.emit(event, { ...data, roomId, userId: user._id || user.id });
    }
  }, [roomId, user]);

  const value = {
    socket,
    isConnected,
    playerState,
    chatMessages,
    listenerCount,
    roomMembers,
    queueUpdate,
    requestsUpdate,
    songChange,
    emitPlayerPlayPause: (isPlaying: boolean, currentTime?: number) => emit("player:play-pause", { isPlaying, currentTime }),
    emitPlayerSeek: (time: number) => emit("player:seek", { time }),
    emitPlayerVolume: (volume: number) => emit("player:volume", { volume }),
    emitPlayerSkip: (direction: "next" | "prev") => emit("player:skip", { direction }),
    emitPlayerShuffle: (shuffle: boolean) => emit("player:shuffle", { shuffle }),
    emitPlayerRepeat: (repeatMode: 'none' | 'one' | 'all') => emit("player:repeat", { repeatMode }),
    emitAddToQueue: (song: any, playNow = false) => emit("player:add-to-queue", { song, playNow }),
    emitUpdateTime: (currentTime: number) => emit("player:update-time", { currentTime }),
    emitChatMessage: (message: string) => emit("chat:message", { message, username: user?.username, avatar: user?.avatar }),
  emitReorderQueue: (fromIndex: number, toIndex: number) => emit("player:reorder-queue", { fromIndex, toIndex }),
    emitRemoveFromQueue: (videoId: string) => emit("player:remove-from-queue", { videoId }),
    emitPlayQueueItem: (videoId: string) => emit("player:play-queue-item", { videoId }),
    emitRequestSong: (song: any) => emit("player:request-song", { song }),
    emitApproveRequest: (videoId: string) => emit("player:approve-request", { videoId }),
    emitRejectRequest: (videoId: string) => emit("player:reject-request", { videoId }),
    emitUpdateRole: (targetUserId: string, newRole: "dj" | "listener") => emit("room:update-role", { targetUserId, newRole }),
    emitKickMember: (targetUserId: string) => emit("room:kick-member", { targetUserId }),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
