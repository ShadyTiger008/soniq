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

  // --- Socket Event Handling: Sync Player State (Time, Play/Pause) ---
  useEffect(() => {
    if (!socketPlayerState) return;

    // Check if user recently interacted (User Action Protection)
    const timeSinceUserAction = Date.now() - lastUserActionRef.current;
    if (timeSinceUserAction < 1000) {
      // Ignore socket updates immediately after user action to prevent jumps/glitches
      return;
    }

    setPlayerState((prev) => {
      const serverTimestamp = (socketPlayerState as any).timestamp || Date.now();
      // Calculate one-way network latency (approximate)
      // We assume the event took some time to reach us.
      // If we don't have perfect clock sync, we rely on the relative diff? 
      // Ideally we use Date.now() - serverVideoTime... but keeping it simple:
      const latency = (Date.now() - serverTimestamp) / 1000;
      
      // Calculate adjusted time based on server playing state
      let adjustedTime = socketPlayerState.currentTime;
      if (socketPlayerState.isPlaying) {
          adjustedTime += latency;
      }
      
      // Drift threshold: How far off before we seek?
      // Host: Trust local more unless MASSIVE drift (>5s) or initial sync
      // Guest: Strict sync if drift > 0.5s (audible)
      
      const timeDiff = Math.abs(prev.currentTime - adjustedTime);

      let newTime = prev.currentTime;

      if (isHost) {
          // As host, we ARE the source of truth usually. 
          // Only sync if we are way off (e.g. page reload, other admin changed it)
          if (timeDiff > 2.0) {
             newTime = adjustedTime;
          }
      } else {
          // As guest, sync if drift is noticeable
          if (timeDiff > 0.5) {
             newTime = adjustedTime;
          } else {
             // If drift is small, we can let it slide OR do a micro-adjustment if using a sophisticated player.
             // For state-based UI, we just update the number. The YouTube player component handles the visual seek.
             // We update state to match server (smooth correction)
             // Actually, if we update state constantly, React might re-render. 
             // But we want the UI slider to be accurate.
             // If we are within 0.5s, let's just stick to our local interpolation or pull closer slowly?
             // For simplicity: If drift < 0.5s, don't force seek, but update internal state reference.
             
             // NOTE: The `YouTubePlayer` effect usually seeks if `props.currentTime` changes significantly.
             // We need to ensure we don't trigger a seek loop.
             // We'll update state, but `YouTubePlayer` checks diff before seeking.
             newTime = adjustedTime;
          }
      }

      return {
        ...prev,
        isPlaying: socketPlayerState.isPlaying,
        volume: socketPlayerState.volume,
        currentTime: newTime,
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
    emitPlayerSkip("next");
  }, [emitPlayerSkip]);

  const skipBackward = useCallback(() => {
    lastUserActionRef.current = Date.now();
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
      emitAddToQueue({
          videoId: song.videoId || song.id,
          title: song.title,
          artist: song.artist,
          duration: typeof song.duration === 'string' ? parseDuration(song.duration) : song.duration,
          thumbnail: song.thumbnail,
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

  // --- Host Authority: Periodic Time Sync ---
  useEffect(() => {
      if (!isHost || !playerState.isPlaying || !playerState.currentSong || !socket) return;

      const syncInterval = setInterval(() => {
          // As host, we periodically broadcast our local currentTime to keep guests in sync
          // This handles slow drifts that aren't large enough to trigger event-based sync
          emitUpdateTime(playerState.currentTime);
      }, 5000); // Every 5 seconds

      return () => clearInterval(syncInterval);
  }, [isHost, playerState.isPlaying, playerState.currentSong, playerState.currentTime, socket, emitUpdateTime]);

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
    if (!socket) return;
    
    // Listen for new members to sync them immediately
    const handleMemberJoined = () => {
        if (isHost && playerState.currentSong) { // Only sync if there is something playing
            // Broadcast current state to ensure new member gets fresh time
            console.log("Host broadcasting sync for new member");
            emitUpdateTime(playerState.currentTime);
            // Also force a play state emit if it's supposed to be playing
            if(playerState.isPlaying) {
                 emitPlayerPlayPause(true, playerState.currentTime);
            }
        }
    };
    
    socket.on("room:member-joined", handleMemberJoined);
    
    return () => {
        socket.off("room:member-joined", handleMemberJoined);
    };
  }, [socket, isHost, playerState.currentTime, playerState.isPlaying, playerState.currentSong, emitUpdateTime, emitPlayerPlayPause]);


  const removeFromQueue = useCallback((videoId: string) => {
      emitRemoveFromQueue(videoId);
  }, [emitRemoveFromQueue]);

  const playQueueItem = useCallback((videoId: string) => {
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
