"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Crown,
  Copy,
  Share2,
  Settings,
  Lock,
  Users,
  Search,
  X,
  Music,
  Clock,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  Play,
} from "lucide-react";
import { WaveformVisualizer } from "@frontend/components/waveform-visualizer";
import { PlayerControls } from "@frontend/components/player-controls";
import { RoomTabs } from "@frontend/components/room-tabs";
import {
  YouTubePlayer,
  extractVideoId,
} from "@frontend/components/youtube-player";
import { RoomSettingsModal } from "@frontend/components/room-settings-modal";
import { useAuth } from "@frontend/lib/auth-context";
import { apiClient } from "@frontend/lib/api-client";
import { useSocket } from "@frontend/lib/socket-client";
import { toast } from "sonner";
import Link from "next/link";

interface Song {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const roomId = (params?.id as string) || "default";

  const [isPlaying, setIsPlaying] = useState(false);
  const [isDJ, setIsDJ] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(
    "dQw4w9WgXcQ"
  );
  const [currentSong, setCurrentSong] = useState<Song | null>({
    id: "1",
    videoId: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    duration: "3:33",
  });
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false); // Prevent conflicts during sync
  const [lastSocketTime, setLastSocketTime] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([
    {
      id: "2",
      videoId: "kJQP7kiw5Fk",
      title: "Despacito",
      artist: "Luis Fonsi",
      duration: "3:47",
    },
    {
      id: "3",
      videoId: "9bZkp7q19f0",
      title: "PSY - GANGNAM STYLE",
      artist: "PSY",
      duration: "4:12",
    },
  ]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [roomSettings, setRoomSettings] = useState({
    name: "Midnight Vibes",
    listeners: 1234,
    isPrivate: false,
    maxListeners: 1000,
    mood: "Chill",
  });
  const [roomData, setRoomData] = useState<any>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isHost, setIsHost] = useState(false);

  // Socket.IO integration
  const {
    isConnected,
    playerState: socketPlayerState,
    chatMessages,
    listenerCount: socketListenerCount,
    queueUpdate,
    songChange,
    roomMembers,
    emitPlayerPlayPause,
    emitPlayerSeek,
    emitPlayerVolume,
    emitPlayerSkip,
    emitAddToQueue,
    emitUpdateTime,
    emitChatMessage,
    emitReorderQueue,
  } = useSocket(roomId && roomId !== "default" ? roomId : null);

  // Fetch room data and join on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/room/" + roomId);
      return;
    }

    // Only fetch if we have a valid room ID
    if (roomId && roomId !== "default") {
      fetchRoomData();
    } else {
      setIsLoadingRoom(false);
      toast.error("Invalid room ID");
      router.push("/home");
    }

    // Don't leave room on unmount - only leave when user explicitly clicks "Leave Room"
    // This prevents accidental room deletion when navigating away
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isAuthenticated]);

  const fetchRoomData = async () => {
    setIsLoadingRoom(true);
    try {
      const response = await apiClient.getRoom(roomId);
      if (response.success && response.data) {
        const room = response.data as any;
        setRoomData(room);
        setRoomSettings({
          name: room.name,
          listeners: room.listenerCount,
          isPrivate: room.isPrivate,
          maxListeners: room.maxListeners,
          mood: room.mood,
        });

        // Check if user is host
        if (user && room.hostId) {
          const hostId =
            typeof room.hostId === "object" ? room.hostId._id : room.hostId;
          const userIsHost = String(user._id || user.id) === String(hostId);
          setIsHost(userIsHost);
          setIsDJ(userIsHost);
        }

        // Set current song if available
        if (room.currentSong) {
          setCurrentSong({
            id: room.currentSong.videoId,
            videoId: room.currentSong.videoId,
            title: room.currentSong.title,
            artist: room.currentSong.artist || "Unknown",
            duration: formatDuration(room.currentSong.duration),
          });
          setCurrentVideoId(room.currentSong.videoId);

          // If there's player state, apply it immediately (for mid-way joins)
          if (room.playerState) {
            // Calculate current time if playing
            let currentTime = room.playerState.currentTime || 0;
            if (room.playerState.isPlaying && room.playerState.lastUpdated) {
              const timeSinceUpdate =
                (Date.now() -
                  new Date(room.playerState.lastUpdated).getTime()) /
                1000;
              currentTime = room.playerState.currentTime + timeSinceUpdate;
              // Cap at song duration
              if (room.currentSong.duration) {
                currentTime = Math.min(currentTime, room.currentSong.duration);
              }
            }

            setIsPlaying(room.playerState.isPlaying || false);
            setCurrentTime(currentTime);
            setVolume(room.playerState.volume || 80);

            console.log("Applied initial player state:", {
              currentTime,
              isPlaying: room.playerState.isPlaying,
              volume: room.playerState.volume,
            });
          }
        }

        // Set queue
        if (room.queue && Array.isArray(room.queue)) {
          setQueue(
            room.queue.map((item: any) => ({
              id: item.videoId,
              videoId: item.videoId,
              title: item.title,
              artist: item.artist || "Unknown",
              duration: formatDuration(item.duration),
              requestedBy:
                item.requestedBy?.username || item.requestedBy || "Unknown",
            }))
          );
        }

        // Update listener count from socket if available
        if (socketListenerCount > 0) {
          setRoomSettings((prev) => ({
            ...prev,
            listeners: socketListenerCount,
          }));
        }

        // Join room (only if not already a member)
        try {
          await apiClient.joinRoom(roomId);
          // Don't show toast for join if user is already in room
        } catch (joinError: any) {
          // If already a member or other error, continue anyway
          if (joinError?.error && !joinError.error.includes("already")) {
            console.warn("Join room warning:", joinError.error);
          }
        }
      } else {
        toast.error(response.error || "Room not found");
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to load room:", error);
      toast.error("Failed to load room");
      router.push("/home");
    } finally {
      setIsLoadingRoom(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Sync player state from socket - ALL users should sync to global state
  useEffect(() => {
    if (socketPlayerState && currentVideoId) {
      setIsSyncing(true); // Prevent handleTimeUpdate from interfering

      // Update local state immediately
      setIsPlaying(socketPlayerState.isPlaying);
      setVolume(socketPlayerState.volume);

      // CRITICAL: Non-host no longer updates currentTime here
      // Time updates are handled in handleTimeUpdate for better control
      // Only update lastSocketTime for tracking
      if (!isHost) {
        // Non-host: Just track socket time, actual update happens in handleTimeUpdate
        setLastSocketTime(socketPlayerState.currentTime);
      } else {
        // Host: Only update if significantly different (prevents micro-adjustments)
        const timeDiff = Math.abs(currentTime - socketPlayerState.currentTime);
        if (timeDiff > 0.3 || lastSocketTime === null) {
          setCurrentTime(socketPlayerState.currentTime);
          setLastSocketTime(socketPlayerState.currentTime);

          if (duration > 0) {
            setProgress((socketPlayerState.currentTime / duration) * 100);
          }
        }
      }

      // Sync YouTube player - wait for it to be ready
      const syncYouTubePlayer = (retryCount = 0) => {
        const player = (window as any).youtubePlayer;
        if (player && typeof player.seekTo === "function") {
          try {
            const playerState = player.getPlayerState();
            // YouTube states: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued

            // Get current player time to avoid unnecessary seeks
            let playerCurrentTime = 0;
            try {
              playerCurrentTime = player.getCurrentTime();
            } catch (e) {
              // Player might not be ready yet
            }

            const timeDiff = Math.abs(
              playerCurrentTime - socketPlayerState.currentTime
            );

            // Seek to correct time if difference is significant (1 second threshold)
            // This threshold prevents unnecessary seeking while ensuring sync
            if (timeDiff > 1.0) {
              player.seekTo(socketPlayerState.currentTime, true);
            }

            // Control playback state - IMPORTANT: Handle unstarted state (-1)
            if (socketPlayerState.isPlaying) {
              // If playing, ensure player is playing (handle unstarted, paused, ended states)
              if (
                playerState === -1 ||
                playerState === 0 ||
                playerState === 2 ||
                playerState === 5
              ) {
                // Unstarted, ended, paused, or cued - need to play
                // For unstarted, load video first then play
                if (playerState === -1) {
                  player.loadVideoById(currentVideoId);
                  // Wait a bit for video to load, then play
                  setTimeout(() => {
                    try {
                      player.seekTo(socketPlayerState.currentTime, true);
                      player.playVideo();
                    } catch (e) {
                      console.error("Error playing after load:", e);
                    }
                  }, 1000);
                } else {
                  player.seekTo(socketPlayerState.currentTime, true);
                  player.playVideo();
                }
              } else if (playerState === 3) {
                // Buffering - wait a bit then play
                setTimeout(() => {
                  try {
                    player.playVideo();
                  } catch (e) {
                    console.error("Error playing after buffer:", e);
                  }
                }, 500);
              }
              // If already playing (state === 1), do nothing
            } else {
              // If paused, ensure player is paused
              if (playerState === 1 || playerState === 3) {
                // Playing or buffering - pause it
                player.pauseVideo();
              }
              // If already paused (state === 2), do nothing
            }

            // Allow time updates after sync completes
            setTimeout(() => setIsSyncing(false), 500);
          } catch (e) {
            console.error("Error syncing YouTube player:", e);
            setIsSyncing(false);
            // Retry up to 5 times
            if (retryCount < 5) {
              setTimeout(() => syncYouTubePlayer(retryCount + 1), 500);
            }
          }
        } else {
          // Player not ready yet, retry up to 10 times
          if (retryCount < 10) {
            setTimeout(() => syncYouTubePlayer(retryCount + 1), 500);
          } else {
            setIsSyncing(false);
          }
        }
      };

      syncYouTubePlayer();
    }
  }, [socketPlayerState, currentVideoId, duration, lastSocketTime]);

  // Update listener count from socket
  useEffect(() => {
    if (socketListenerCount > 0) {
      setRoomSettings((prev) => ({
        ...prev,
        listeners: socketListenerCount,
      }));
    }
  }, [socketListenerCount]);

  // Handle queue updates from socket
  useEffect(() => {
    if (queueUpdate?.queue) {
      setQueue(
        queueUpdate.queue.map((item: any) => ({
          id: item.videoId,
          videoId: item.videoId,
          title: item.title,
          artist: item.artist || "Unknown",
          duration: formatDuration(item.duration),
        }))
      );
    }
  }, [queueUpdate]);

  // Handle song changes from socket
  useEffect(() => {
    if (songChange) {
      if (songChange.currentSong) {
        setCurrentSong({
          id: songChange.currentSong.videoId,
          videoId: songChange.currentSong.videoId,
          title: songChange.currentSong.title,
          artist: songChange.currentSong.artist || "Unknown",
          duration: formatDuration(songChange.currentSong.duration),
        });
        setCurrentVideoId(songChange.currentSong.videoId);

        // Apply player state from socket
        if (songChange.playerState) {
          setIsPlaying(songChange.playerState.isPlaying);
          setCurrentTime(songChange.playerState.currentTime);
          setVolume(songChange.playerState.volume);
        } else {
          // Default to playing when song changes
          setIsPlaying(true);
          setCurrentTime(0);
        }
      }
      if (songChange.queue) {
        setQueue(
          songChange.queue.map((item: any) => ({
            id: item.videoId,
            videoId: item.videoId,
            title: item.title,
            artist: item.artist || "Unknown",
            duration: formatDuration(item.duration),
            requestedBy:
              item.requestedBy?.username || item.requestedBy || "Unknown",
          }))
        );
      }
    }
  }, [songChange]);

  // CRITICAL FIX: Only the HOST should broadcast time updates
  // This prevents conflicts where multiple users broadcast conflicting times
  // Non-hosts should only receive and sync to the host's time
  useEffect(() => {
    // Only host broadcasts time updates
    if (!isHost || !isPlaying || !currentVideoId || isSyncing) return;

    const interval = setInterval(() => {
      const player = (window as any).youtubePlayer;
      if (player && typeof player.getPlayerState === "function") {
        try {
          const playerState = player.getPlayerState();
          // Only broadcast if player is actually playing (state === 1)
          if (playerState === 1 && currentTime > 0 && !isSyncing) {
            const actualTime = player.getCurrentTime();
            // Only broadcast if time has progressed (prevents stuck time issues)
            // Also ensure we're not broadcasting stale time
            if (actualTime > currentTime - 0.5 && actualTime > 0) {
              emitUpdateTime(actualTime);
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }, 1000); // Host broadcasts every 1 second for better sync

    return () => clearInterval(interval);
  }, [
    isHost,
    isPlaying,
    currentTime,
    currentVideoId,
    emitUpdateTime,
    isSyncing,
  ]);

  // Real YouTube search
  const searchYouTube = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiClient.searchYouTube(query.trim(), 10);
      if (response.success && response.data) {
        const results: Song[] = (response.data as any[]).map((item) => ({
          id: item.videoId,
          videoId: item.videoId,
          title: item.title,
          artist: item.artist || "Unknown Artist",
          duration: formatDuration(item.duration),
          thumbnail: item.thumbnail,
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
        toast.error("No results found");
      }
    } catch (error) {
      console.error("Error searching YouTube:", error);
      setSearchResults([]);
      toast.error("Failed to search YouTube. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchYouTube(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchYouTube]);

  const handlePlayPause = () => {
    // Anyone can control playback
    const newIsPlaying = !isPlaying;
    // Don't update local state immediately - wait for socket confirmation
    // This prevents the double-click issue where first click pauses, second click plays
    emitPlayerPlayPause(newIsPlaying);
    // Local state will be updated via socket event (player:state-changed)
  };

  const handleSkip = (direction: "prev" | "next") => {
    // Anyone can skip
    emitPlayerSkip(direction);
    // Local state will be updated via socket events
  };

  const handleSeek = (amount: number) => {
    // Anyone can seek
    const newTime = Math.max(0, Math.min(duration, currentTime + amount));
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
    if ((window as any).youtubePlayer) {
      try {
        (window as any).youtubePlayer.seekTo(newTime, true);
      } catch (e) {
        console.error("Error seeking:", e);
      }
    }
    emitPlayerSeek(newTime);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Anyone can seek
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
    if ((window as any).youtubePlayer) {
      try {
        (window as any).youtubePlayer.seekTo(newTime, true);
      } catch (e) {
        console.error("Error seeking:", e);
      }
    }
    emitPlayerSeek(newTime);
  };

  const handleTimeUpdate = (time: number, totalDuration: number) => {
    // Always update duration (this is safe and needed)
    setDuration(totalDuration);

    // Don't update time if we're currently syncing (prevents conflicts)
    if (isSyncing) {
      return;
    }

    if (isHost) {
      // HOST: Always use local time (authoritative source)
      // Local time from YouTube player is the source of truth for the host
      // Only validate against socket time if there's a large discrepancy (>2s)
      if (socketPlayerState) {
        const timeDiff = Math.abs(time - socketPlayerState.currentTime);

        // If socket time is significantly different (>2 seconds), someone else might have seeked
        // In this case, trust socket time over local time
        if (timeDiff > 2.0) {
          setCurrentTime(socketPlayerState.currentTime);
          setLastSocketTime(socketPlayerState.currentTime);
          if (totalDuration > 0) {
            setProgress((socketPlayerState.currentTime / totalDuration) * 100);
          }
          return;
        }
      }

      // Normal case: Use local time for smooth playback (authoritative)
      // Only update if time is progressing forward (prevents stuck time)
      if (time >= currentTime - 0.1) {
        setCurrentTime(time);
        if (totalDuration > 0) {
          setProgress((time / totalDuration) * 100);
        }
      }
    } else {
      // NON-HOST: Use socket time with smooth interpolation to avoid stuttering
      // Large differences (>2s) trigger immediate sync + seek
      if (socketPlayerState) {
        const timeDiff = Math.abs(time - socketPlayerState.currentTime);

        // Large difference (>2s) - immediate sync required (likely seek happened)
        if (timeDiff > 2.0) {
          // Trigger immediate sync by updating time and seeking player
          setCurrentTime(socketPlayerState.currentTime);
          setLastSocketTime(socketPlayerState.currentTime);
          if (totalDuration > 0) {
            setProgress((socketPlayerState.currentTime / totalDuration) * 100);
          }

          // Seek player to correct position
          const player = (window as any).youtubePlayer;
          if (player && typeof player.seekTo === "function") {
            try {
              player.seekTo(socketPlayerState.currentTime, true);
            } catch (e) {
              console.error("Error seeking player:", e);
            }
          }
          return;
        }

        // Small difference - use socket time (smooth interpolation)
        // Socket time is the source of truth, but we can use local time for smooth UI
        // Only if it's close to socket time (within 0.5s)
        if (timeDiff < 0.5 && time >= currentTime - 0.1) {
          // Use local time for smooth interpolation (close to socket time)
          setCurrentTime(time);
          if (totalDuration > 0) {
            setProgress((time / totalDuration) * 100);
          }
        } else {
          // Use socket time (more accurate)
          setCurrentTime(socketPlayerState.currentTime);
          setLastSocketTime(socketPlayerState.currentTime);
          if (totalDuration > 0) {
            setProgress((socketPlayerState.currentTime / totalDuration) * 100);
          }
        }
      } else {
        // No socket state yet - use local time as fallback
        if (time >= currentTime - 0.1) {
          setCurrentTime(time);
          if (totalDuration > 0) {
            setProgress((time / totalDuration) * 100);
          }
        }
      }
    }
  };

  const handleSelectSong = (song: Song) => {
    // If host, play immediately; otherwise add to queue
    emitAddToQueue(
      {
        videoId: song.videoId,
        title: song.title,
        artist: song.artist,
        duration: parseDuration(song.duration),
      },
      isHost // playNow = true if host
    );
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleAddToQueue = (song: Song) => {
    emitAddToQueue({
      videoId: song.videoId,
      title: song.title,
      artist: song.artist,
      duration: parseDuration(song.duration),
    });
    setShowSearch(false);
    setSearchQuery("");
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

  const handleShareRoom = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Join ${roomSettings.name} on SONIQ`,
      text: `Listen to music together in ${roomSettings.name}. Join now!`,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    }
  };

  const handleCopyInvite = async () => {
    const inviteCode = `SONIQ-${roomId.toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLeaveRoom = async () => {
    const isHostLeaving = isHost;
    const message = isHostLeaving
      ? "Are you sure you want to leave and delete this room? This action cannot be undone."
      : "Are you sure you want to leave this room?";

    if (confirm(message)) {
      try {
        // Only delete room if host is leaving and confirms
        await apiClient.leaveRoom(roomId, isHostLeaving);
        toast.success(
          isHostLeaving ? "Room deleted successfully" : "Left room successfully"
        );
        router.push("/home");
      } catch (error) {
        toast.error("Failed to leave room");
        router.push("/home");
      }
    }
  };

  const handleSaveSettings = async (settings: {
    name: string;
    isPrivate: boolean;
    maxListeners: number;
    mood: string;
  }) => {
    try {
      const response = await apiClient.updateRoom(roomId, {
        name: settings.name,
        isPrivate: settings.isPrivate,
        maxListeners: settings.maxListeners,
        mood: settings.mood,
      });

      if (response.success) {
        setRoomSettings({
          ...roomSettings,
          ...settings,
        });
        toast.success("Room settings saved successfully!");
        setShowSettings(false);
        // Refresh room data
        await fetchRoomData();
      } else {
        toast.error(response.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred while saving settings");
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="from-midnight-black via-deep-navy to-midnight-black flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="border-soft-white h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="from-midnight-black via-deep-navy to-midnight-black flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="border-soft-white h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="from-midnight-black via-deep-navy to-midnight-black text-soft-white min-h-screen bg-gradient-to-b pb-20">
      {/* Premium Header with Navigation */}
      <div
        className="border-deep-purple/20 sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{ background: "rgba(15, 11, 36, 0.95)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="smooth-transition text-muted-foreground hover:text-soft-white rounded-lg p-2 hover:bg-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading font-700 text-lg">
                {roomSettings.name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                {roomSettings.listeners.toLocaleString()} listening
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLeaveRoom}
              className="smooth-transition text-muted-foreground hover:text-destructive rounded-lg p-2 hover:bg-white/5"
              title="Leave Room"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin banner */}
      {isDJ && (
        <div className="from-deep-purple/20 to-electric-magenta/20 border-electric-magenta/30 sticky top-[57px] z-20 flex items-center gap-3 border-b bg-gradient-to-r px-4 py-2.5">
          <Crown className="text-electric-magenta h-4 w-4" />
          <p className="font-500 text-xs">
            Admin Control Enabled • You can control playback for this room
          </p>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-3">
        {/* Main player section */}
        <div className="lg:col-span-2 space-y-6">
          {/* YouTube Player */}
          <div className="glass-card overflow-hidden rounded-2xl border-2 border-deep-purple/20 shadow-2xl shadow-electric-magenta/10">
            <div className="relative aspect-video bg-black">
              <YouTubePlayer
                videoId={currentVideoId}
                isPlaying={isPlaying}
                volume={volume}
                onTimeUpdate={handleTimeUpdate}
                onStateChange={(state) => {
                  // YouTube player states: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued

                  if (isHost) {
                    // HOST: Can update state via player events
                    // Host's local player state is authoritative
                    // But still validate against socket if available
                    if (state === 1) {
                      // Playing
                      if (!socketPlayerState || socketPlayerState.isPlaying) {
                        setIsPlaying(true);
                      }
                    } else if (state === 2) {
                      // Paused
                      if (!socketPlayerState || !socketPlayerState.isPlaying) {
                        setIsPlaying(false);
                      }
                    }
                  } else {
                    // NON-HOST: Ignore player state changes completely
                    // Only socket controls playback for non-host users
                    // This prevents conflicts where local player state overrides socket state
                    return;
                  }
                }}
                onReady={() => {
                  // When player is ready, sync to current socket state if available
                  // This is crucial for mid-way joins - MUST auto-play if song is playing
                  const syncOnReady = (retryCount = 0) => {
                    const player = (window as any).youtubePlayer;
                    if (player && currentVideoId) {
                      try {
                        // Get duration first
                        const playerDuration = player.getDuration();
                        if (playerDuration && playerDuration > 0) {
                          setDuration(playerDuration);
                        }

                        // If we have socket state, sync to it
                        if (socketPlayerState) {
                          // Seek to the correct time (important for mid-way joins)
                          const targetTime = Math.min(
                            socketPlayerState.currentTime,
                            playerDuration || socketPlayerState.currentTime
                          );

                          // Seek first
                          player.seekTo(targetTime, true);
                          setCurrentTime(targetTime);

                          if (playerDuration > 0) {
                            setProgress((targetTime / playerDuration) * 100);
                          }

                          // CRITICAL: Auto-play if song is playing in room
                          // This fixes the issue where new joiners need to click play
                          if (socketPlayerState.isPlaying) {
                            // Small delay to ensure seek completes, then play
                            setTimeout(() => {
                              try {
                                const currentState = player.getPlayerState();
                                // Play if not already playing
                                if (currentState !== 1) {
                                  player.playVideo();
                                  setIsPlaying(true);
                                }
                              } catch (e) {
                                console.error(
                                  "Error auto-playing on ready:",
                                  e
                                );
                              }
                            }, 200);
                          } else {
                            // Ensure paused if room is paused
                            player.pauseVideo();
                            setIsPlaying(false);
                          }

                          console.log("Player synced on ready:", {
                            time: targetTime,
                            isPlaying: socketPlayerState.isPlaying,
                            duration: playerDuration,
                          });
                        } else {
                          // No socket state yet - wait for it
                          if (retryCount < 5) {
                            setTimeout(() => syncOnReady(retryCount + 1), 500);
                          }
                        }
                      } catch (e) {
                        console.error("Error syncing player on ready:", e);
                        // Retry after a short delay
                        if (retryCount < 5) {
                          setTimeout(() => syncOnReady(retryCount + 1), 500);
                        }
                      }
                    } else if (retryCount < 5) {
                      // Player not ready yet, retry
                      setTimeout(() => syncOnReady(retryCount + 1), 500);
                    }
                  };

                  // Wait a bit for player to fully initialize
                  setTimeout(() => syncOnReady(), 300);
                }}
              />
              {/* Search Overlay */}
              {showSearch && (
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-md">
                  <div className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-heading font-700 text-xl flex items-center gap-2">
                        <Search className="text-electric-magenta h-5 w-5" />
                        Search & Play
                      </h3>
                      <button
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="smooth-transition text-muted-foreground hover:text-soft-white rounded-lg p-2 hover:bg-white/10"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="relative mb-4">
                      <Search className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for songs, artists..."
                        autoFocus
                        className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta focus:ring-electric-magenta smooth-transition w-full rounded-xl border-2 border-white/20 bg-white/10 py-3 pr-4 pl-10 focus:ring-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                      {searchResults.map((song) => (
                        <div
                          key={song.id}
                          className="glass-card hover:border-electric-magenta smooth-transition group flex items-center justify-between rounded-xl p-4 border-2 border-transparent"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="from-deep-purple to-electric-magenta flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br">
                              <Music className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-600 text-soft-white truncate">
                                {song.title}
                              </p>
                              <p className="text-muted-foreground text-sm truncate">
                                {song.artist}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{song.duration}</span>
                            </div>
                            <button
                              onClick={() => handleSelectSong(song)}
                              className="from-deep-purple to-electric-magenta text-soft-white smooth-transition rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold opacity-0 group-hover:opacity-100 hover:shadow-lg hover:shadow-electric-magenta/30"
                            >
                              <Play className="mr-1 inline h-4 w-4" />
                              Play
                            </button>
                            <button
                              onClick={() => handleAddToQueue(song)}
                              className="glass-card text-soft-white smooth-transition rounded-lg px-3 py-2 text-sm opacity-0 group-hover:opacity-100 hover:border-electric-magenta"
                            >
                              + Queue
                            </button>
                          </div>
                        </div>
                      ))}
                      {searchQuery && searchResults.length === 0 && (
                        <div className="text-muted-foreground py-12 text-center">
                          <Music className="mx-auto mb-3 h-12 w-12 opacity-50" />
                          <p className="mb-1">No results found</p>
                          <p className="text-sm">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Player info and controls */}
          <div className="glass-card rounded-2xl p-6 border-2 border-deep-purple/20 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-700 text-soft-white mb-1 text-2xl truncate">
                  {currentSong?.title || "Now Playing"}
                </h2>
                <p className="text-muted-foreground truncate">
                  {currentSong?.artist || "Artist • Album Name"}
                </p>
              </div>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink text-soft-white smooth-transition rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold shadow-lg shadow-electric-magenta/20 ml-4 shrink-0"
              >
                <Search className="mr-2 inline h-4 w-4" />
                Search
              </button>
            </div>

            <PlayerControls
              isPlaying={isPlaying}
              isDJ={isDJ}
              volume={volume}
              currentTime={currentTime}
              duration={duration}
              progress={progress}
              onPlayPause={handlePlayPause}
              onSkip={handleSkip}
              onSeek={handleSeek}
              onVolumeChange={(vol) => {
                // Anyone can control volume
                setVolume(vol);
                emitPlayerVolume(vol);
              }}
              onProgressClick={handleProgressClick}
            />
          </div>

          {/* Waveform visualizer */}
          <div className="glass-card h-40 overflow-hidden rounded-2xl border-2 border-deep-purple/20">
            <WaveformVisualizer />
          </div>

          {/* Tabs section - Fixed height with proper overflow */}
          <div className="glass-card min-h-[500px] overflow-hidden rounded-2xl border-2 border-deep-purple/20">
            <RoomTabs
              queue={queue}
              currentSong={currentSong}
              chatMessages={chatMessages}
              onSendMessage={emitChatMessage}
              currentUserId={user?._id || user?.id}
              isConnected={isConnected}
              roomMembers={roomMembers}
              isHost={isHost}
              onReorderQueue={emitReorderQueue}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Room header */}
          <div className="glass-card rounded-2xl p-6 border-2 border-deep-purple/20 shadow-xl">
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading font-700 text-xl flex items-center gap-2">
                  {roomSettings.name}
                  {roomSettings.isPrivate && (
                    <Lock className="text-electric-magenta h-4 w-4" />
                  )}
                </h3>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{roomSettings.listeners.toLocaleString()} listening</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mb-4 grid grid-cols-3 gap-2 border-b border-[rgba(108,43,217,0.2)] pb-4">
              <div className="text-center">
                <p className="font-700 text-electric-magenta text-xl">98%</p>
                <p className="text-muted-foreground text-xs">Synced</p>
              </div>
              <div className="text-center">
                <p className="font-700 text-ocean-blue text-xl">4.2s</p>
                <p className="text-muted-foreground text-xs">Latency</p>
              </div>
              <div className="text-center">
                <p className="font-700 text-neon-cyan text-xl">24h</p>
                <p className="text-muted-foreground text-xs">Room Age</p>
              </div>
            </div>

            {/* Room actions */}
            <div className="space-y-2">
              <button
                onClick={handleShareRoom}
                className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink font-500 smooth-transition neon-glow flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2.5 text-sm shadow-lg shadow-electric-magenta/20"
              >
                {shared ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share Room
                  </>
                )}
              </button>
              <button
                onClick={handleCopyInvite}
                className="glass-card hover:border-ocean-blue font-500 smooth-transition flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm border-2 border-transparent"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Invite
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="glass-card hover:border-electric-magenta font-500 smooth-transition flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm border-2 border-transparent"
              >
                <Settings className="h-4 w-4" />
                Room Settings
              </button>
            </div>
          </div>

          {/* Upcoming section */}
          <div className="glass-card rounded-xl p-4 border-2 border-deep-purple/20">
            <h4 className="font-heading font-600 text-soft-white mb-3 flex items-center gap-2">
              <Music className="h-4 w-4 text-electric-magenta" />
              Up Next
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {queue.length > 0 ? (
                queue.slice(0, 5).map((song) => (
                  <div
                    key={song.id}
                    className="rounded-lg bg-[rgba(108,43,217,0.1)] p-3 border border-deep-purple/20 hover:border-electric-magenta/50 smooth-transition cursor-pointer"
                  >
                    <p className="font-500 text-soft-white text-sm truncate">
                      {song.title}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {song.artist} • {song.duration}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-6 text-center">
                  <Music className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No songs in queue</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <Link
            href="/room/create"
            className="hover:border-electric-magenta text-muted-foreground hover:text-electric-magenta smooth-transition font-500 block w-full rounded-xl border-2 border-dashed border-[rgba(108,43,217,0.3)] p-3 text-center text-sm"
          >
            Create New Room
          </Link>
        </div>
      </div>

      {/* Room Settings Modal */}
      <RoomSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        roomName={roomSettings.name}
        isPrivate={roomSettings.isPrivate}
        maxListeners={roomSettings.maxListeners}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
