import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSocketContext } from "@frontend/lib/socket-context";
import type { Song, PlayerState } from "@frontend/types";

export function useRoomPlayer(roomId: string, userId: string | undefined, isHost: boolean) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    volume: 80,
    currentSong: null,
    queue: [],
    duration: 0,
    isBuffering: false,
    isSyncing: false,
    shuffle: false,
    repeatMode: 'none',
    requests: [],
  });

  const lastUserActionRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerStateRef = useRef<PlayerState>(playerState);

  // Keep ref in sync
  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  const {
    socket,
    playerState: socketPlayerState,
    queueUpdate,
    songChange,
    emitPlayerPlayPause,
    emitPlayerSeek,
    emitPlayerVolume,
    emitPlayerSkip,
    emitPlayerShuffle,
    emitPlayerRepeat,
    emitAddToQueue,
    emitUpdateTime,
    emitReorderQueue,
    emitRemoveFromQueue,
    emitPlayQueueItem,
    requestsUpdate,
    emitRequestSong,
    emitApproveRequest,
    emitRejectRequest,
  } = useSocketContext();

  // --- Helper: Format Duration ---
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0] || "0", 10);
      const seconds = parseInt(parts[1] || "0", 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  // --- Socket Event Handling: Song Changes ---
  useEffect(() => {
    if (songChange) {
      setPlayerState((prev) => {
        const newSong = songChange.currentSong ? {
          id: songChange.currentSong.videoId,
          videoId: songChange.currentSong.videoId,
          title: songChange.currentSong.title,
          artist: songChange.currentSong.artist || "Unknown",
          duration: formatDuration(songChange.currentSong.duration),
          thumbnail: songChange.currentSong.thumbnail,
        } : null;

        const newQueue = songChange.queue ? songChange.queue.map((item: any) => ({
            id: item._id || item.id || item.videoId, // Use stable _id
            videoId: item.videoId,
            title: item.title,
            artist: item.artist || "Unknown",
            duration: formatDuration(item.duration),
            requestedBy: item.requestedBy?.username || (typeof item.requestedBy === 'string' ? item.requestedBy : "Unknown"),
            requestedById: item.requestedBy?._id || item.requestedBy?.id || (typeof item.requestedBy === 'string' ? undefined : undefined),
        })) : prev.queue;

        const newRequests = songChange.requests ? songChange.requests.map((item: any) => ({
            id: item._id || item.id || item.videoId,
            videoId: item.videoId,
            title: item.title,
            artist: item.artist || "Unknown",
            duration: formatDuration(item.duration),
            thumbnail: item.thumbnail,
            requestedBy: item.requestedBy?.username || (typeof item.requestedBy === 'string' ? item.requestedBy : "Unknown"),
            requestedById: item.requestedBy?._id || item.requestedBy?.id,
        })) : prev.requests;

        return {
          ...prev,
          currentSong: newSong,
          queue: newQueue,
          requests: newRequests || [],
          // When song changes, update player state if provided, otherwise default to playing
          isPlaying: songChange.playerState ? songChange.playerState.isPlaying : true,
          currentTime: songChange.playerState ? songChange.playerState.currentTime : 0,
          volume: songChange.playerState ? songChange.playerState.volume : prev.volume,
        };
      });
    }
  }, [songChange]);

  // --- Socket Event Handling: Queue Updates ---
  useEffect(() => {
    if (queueUpdate?.queue) {
      console.log("Queue update received in hook:", queueUpdate);
      setPlayerState((prev) => ({
        ...prev,
        queue: queueUpdate.queue.map((item: any) => ({
          id: item._id || item.id || item.videoId || `temp-${Math.random().toString(36).substr(2, 9)}`, // Fail-safe ID
          videoId: item.videoId,
          title: item.title,
          artist: item.artist || "Unknown",
          duration: formatDuration(item.duration),
          requestedBy: item.requestedBy?.username || (typeof item.requestedBy === 'string' ? item.requestedBy : "Unknown"),
          requestedById: item.requestedBy?._id || item.requestedBy?.id,
        })),
      }));
    }
  }, [queueUpdate]);

  // --- Socket Event Handling: Requests Updates ---
  useEffect(() => {
    if (requestsUpdate?.requests) {
        setPlayerState((prev) => ({
            ...prev,
            requests: requestsUpdate.requests.map((item: any) => ({
                id: item._id || item.id || item.videoId,
                videoId: item.videoId,
                title: item.title,
                artist: item.artist || "Unknown",
                duration: formatDuration(item.duration),
                thumbnail: item.thumbnail,
                requestedBy: item.requestedBy?.username || (typeof item.requestedBy === 'string' ? item.requestedBy : "Unknown"),
                requestedById: item.requestedBy?._id || item.requestedBy?.id,
            }))
        }));
    }
  }, [requestsUpdate]);

  // --- Layer 3: Precise Sync Correction ---
  useEffect(() => {
    if (!socketPlayerState) return;

    // 1. Skip if user recently interacted (Optimistic Lock)
    const timeSinceUserAction = Date.now() - lastUserActionRef.current;
    if (timeSinceUserAction < 800) return;

    const serverTimeAtEmit = (socketPlayerState as any).serverTimeAtEmit || (socketPlayerState as any).timestamp || Date.now();
    
    // 2. Calculate Correction (elapsed time since server emitted)
    const elapsed = (Date.now() - serverTimeAtEmit) / 1000;
    const correctedPosition = socketPlayerState.currentTime + (socketPlayerState.isPlaying ? elapsed : 0);
    
    setPlayerState((prev) => {
      const drift = Math.abs(prev.currentTime - correctedPosition);
      
      // 3. Apply correction based on drift threshold
      // Host: Trust local unless massive drift (> 5s)
      // Listener: Correct if drift > 0.3s (premium responsiveness)
      const threshold = isHost ? 5.0 : 0.3;
      
      if (drift > threshold || prev.isPlaying !== socketPlayerState.isPlaying) {
        return {
          ...prev,
          isPlaying: socketPlayerState.isPlaying,
          volume: socketPlayerState.volume,
          currentTime: correctedPosition,
          shuffle: socketPlayerState.shuffle,
          repeatMode: socketPlayerState.repeatMode,
        };
      }
      
      return {
        ...prev,
        isPlaying: socketPlayerState.isPlaying,
        volume: socketPlayerState.volume,
        shuffle: socketPlayerState.shuffle,
        repeatMode: socketPlayerState.repeatMode,
      };
    });
  }, [socketPlayerState, isHost]);


  // --- Actions ---

  const togglePlayPause = useCallback(() => {
    lastUserActionRef.current = Date.now();
    
    setPlayerState(prev => {
        const newIsPlaying = !prev.isPlaying;
        // Optimistic update
        emitPlayerPlayPause(newIsPlaying, prev.currentTime);
        return { ...prev, isPlaying: newIsPlaying };
    });
  }, [emitPlayerPlayPause]);

  const setVolume = useCallback((vol: number) => {
    setPlayerState(prev => ({ ...prev, volume: vol })); // Volume feels laggy if not optimistic
    emitPlayerVolume(vol);
  }, [emitPlayerVolume]);

  const seekTo = useCallback((time: number) => {
    lastUserActionRef.current = Date.now();
    
    // Optimistic for slider responsiveness, but rely on socket for final confirmation
    setPlayerState(prev => ({ ...prev, currentTime: time }));
    
    emitPlayerSeek(time);
  }, [emitPlayerSeek]);

  const skipForward = useCallback(() => {
    lastUserActionRef.current = Date.now();
    
    // Layer 1: Optimistic UI
    setPlayerState(prev => {
      if (prev.queue.length === 0) return prev;
      const nextSong = prev.queue[0];
      const newQueue = prev.queue.slice(1);
      if (prev.repeatMode === 'all' && prev.currentSong) {
        newQueue.push(prev.currentSong);
      }
      return {
        ...prev,
        currentSong: nextSong || null,
        queue: newQueue,
        currentTime: 0,
        isPlaying: true
      };
    });
    
    emitPlayerSkip("next");
  }, [emitPlayerSkip]);

  const skipBackward = useCallback(() => {
    lastUserActionRef.current = Date.now();
    setPlayerState(prev => ({ ...prev, currentTime: 0 }));
    emitPlayerSkip("prev");
  }, [emitPlayerSkip]);

  const toggleShuffle = useCallback(() => {
      const newShuffle = !playerState.shuffle;
      emitPlayerShuffle(newShuffle);
  }, [playerState.shuffle, emitPlayerShuffle]);

  const cycleRepeatMode = useCallback(() => {
      const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(playerState.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      if (nextMode) emitPlayerRepeat(nextMode);
  }, [playerState.repeatMode, emitPlayerRepeat]);

  const addToQueue = useCallback((song: Song) => {
    // Layer 1: Optimistic UI
    const songData: Song = {
      id: song.id || song.videoId,
      videoId: song.videoId || song.id || "",
      title: song.title,
      artist: song.artist,
      duration: typeof song.duration === "string" ? song.duration : formatDuration(song.duration),
      thumbnail: song.thumbnail,
      requestedBy: "You",
    };

    setPlayerState(prev => ({
      ...prev,
      queue: [...prev.queue, songData]
    }));

    emitAddToQueue({
      videoId: songData.videoId,
      title: songData.title,
      artist: songData.artist,
      duration: typeof song.duration === 'string' ? parseDuration(song.duration) : song.duration,
      thumbnail: songData.thumbnail,
    });
  }, [emitAddToQueue]);

  const requestSong = useCallback((song: Song) => {
      emitRequestSong({
          videoId: song.videoId || song.id,
          title: song.title,
          artist: song.artist,
          duration: typeof song.duration === 'string' ? parseDuration(song.duration) : song.duration,
          thumbnail: song.thumbnail,
      });
  }, [emitRequestSong]);

  const approveRequest = useCallback((videoId: string) => {
      emitApproveRequest(videoId);
      // Optimistic? No, wait for socket update to prevent desync
  }, [emitApproveRequest]);

  const rejectRequest = useCallback((videoId: string) => {
      emitRejectRequest(videoId);
  }, [emitRejectRequest]);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
      setPlayerState(prev => {
          const newQueue = [...prev.queue];
          const [moved] = newQueue.splice(fromIndex, 1);
          if (moved) {
            newQueue.splice(toIndex, 0, moved);
          }
          return {
              ...prev,
              queue: newQueue
          };
      });
      emitReorderQueue(fromIndex, toIndex);
  }, [emitReorderQueue]);

  // --- Layer 5: Passive Drift Correction ---
  useEffect(() => {
      if (!playerState.isPlaying || !playerState.currentSong || !socket) return;

      const syncInterval = setInterval(() => {
          // Request current state from server for drift check
          socket.emit("player:get-state", { roomId });
      }, 5000); 

      return () => clearInterval(syncInterval);
  }, [playerState.isPlaying, playerState.currentSong, socket, roomId]);

  const handleTimeUpdate = useCallback((time: number, duration: number) => {
      // Update local state by merging with prev state to avoid overwrites
      // Use functional state update to ensure we have latest queue etc
      setPlayerState(prev => {
          if (time === prev.currentTime) return prev;
          return {
            ...prev,
            currentTime: time,
            duration: duration
          };
      });

      // We rely on periodic updates or event-driven updates for socket
      // Not emitting here on every millisecond to avoid flood
  }, []);

  // Sync Logic: Host Authority
  useEffect(() => {
    if (!socket || !isHost) return;
    
    // Listen for new members to sync them immediately
    const handleMemberJoined = () => {
        const currentState = playerStateRef.current;
        if (currentState.currentSong) { 
            console.log("Host broadcasting sync for new member at", currentState.currentTime);
            emitUpdateTime(currentState.currentTime);
            if(currentState.isPlaying) {
                 emitPlayerPlayPause(true, currentState.currentTime);
            }
        }
    };
    
    socket.on("room:member-joined", handleMemberJoined);
    
    return () => {
        socket.off("room:member-joined", handleMemberJoined);
    };
  }, [socket, isHost, emitUpdateTime, emitPlayerPlayPause]);


  const removeFromQueue = useCallback((videoId: string) => {
      // Layer 1: Optimistic UI
      setPlayerState(prev => ({
          ...prev,
          queue: prev.queue.filter(item => item.videoId !== videoId)
      }));
      emitRemoveFromQueue(videoId);
  }, [emitRemoveFromQueue]);

  const playQueueItem = useCallback((videoId: string) => {
      // Layer 1: Optimistic UI
      setPlayerState(prev => {
          const songIndex = prev.queue.findIndex(item => item.videoId === videoId);
          if (songIndex === -1) return prev;
          const songToPlay = prev.queue[songIndex];
          const newQueue = [...prev.queue];
          newQueue.splice(songIndex, 1);
          return {
              ...prev,
              currentSong: songToPlay || null,
              queue: newQueue,
              currentTime: 0,
              isPlaying: true
          };
      });
      emitPlayQueueItem(videoId);
  }, [emitPlayQueueItem]);

  const playSong = useCallback((song: Song) => {
    // "Play Now" logic: Add to queue with high priority / playNow flag
    // Determine if we need to construct a proper song object from a search result or Partial<Song>
    const songData = {
        videoId: song.videoId || song.id,
        title: song.title,
        artist: song.artist,
        duration: typeof song.duration === 'string' ? parseDuration(song.duration) : song.duration,
        thumbnail: song.thumbnail,
    };
    emitAddToQueue(songData, true); 
  }, [emitAddToQueue]);

  return {
    playerState,
    togglePlayPause,
    setVolume,
    seekTo,
    skipForward,
    skipBackward,
    addToQueue,
    removeFromQueue,
    playQueueItem,
    reorderQueue,
    toggleShuffle,
    cycleRepeatMode,
    playSong, // Exposed new function
    requestSong,
    approveRequest,
    rejectRequest,
    handleTimeUpdate,
    setIsBuffering: (isBuffering: boolean) => setPlayerState(prev => ({ ...prev, isBuffering })),
    setIsPlaying: (isPlaying: boolean) => setPlayerState(prev => ({ ...prev, isPlaying })),
    setDuration: (duration: number) => setPlayerState(prev => ({ ...prev, duration }))
  };
}
