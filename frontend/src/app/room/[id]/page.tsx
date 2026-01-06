"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Pause,
  GripVertical
} from "lucide-react";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ThemeToggle } from "@frontend/components/theme-toggle";
import { AppShell } from "@frontend/components/layout/app-shell";
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
import { SocketProvider, useSocketContext } from "@frontend/lib/socket-context";
import { useRoomPlayer } from "@frontend/hooks/use-room-player";
import type { Song } from "@frontend/types";
import { toast } from "sonner";
import Link from "next/link";
import { QueueSongItem } from "@frontend/components/queue-song-item";

// Sortable Item Wrapper
function SortableQueueItem({ song, index, isCurrent, onClick, isDJ }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: song.id }); // Use direct stable ID

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 bg-card/50 dark:bg-white/[0.03] backdrop-blur-md border border-border dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                 {/* Drag Handle */}
                 {isDJ && (
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-primary text-muted-foreground transition-colors p-1">
                        <GripVertical className="h-4 w-4" />
                    </div>
                 )}
                 {!isDJ && (
                    <div className="text-muted-foreground w-4 text-center text-sm font-mono">{index + 1}</div>
                 )}
                
                 {/* Clickable Area for Play */}
                 <div className="flex-1 min-w-0 flex items-center gap-4 cursor-pointer" onClick={() => onClick(song)}>
                     <div className="h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                        {song.thumbnail ? (
                            <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" /> 
                        ) : <Music className="h-5 w-5 text-muted-foreground" />}
                     </div>
                      <div className="flex-1 min-w-0">
                         <p className={`font-semibold truncate tracking-tight ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                             {song.title}
                         </p>
                         <p className="text-sm text-muted-foreground/80 truncate font-medium">{song.artist}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-mono text-muted-foreground/60 block mb-0.5">{song.duration}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-bold">BY {song.requestedBy}</span>
                      </div>
                 </div>
            </div>
        </div>
    );
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const roomId = (params?.id as string) || "default";

  // State formerly handled manually is now in the hook
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  // queue is in hook
  const [copied, setCopied] = useState(false);

  const [shared, setShared] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [roomSettings, setRoomSettings] = useState({
    name: "Midnight Vibes",
    listeners: 1234,
    isPrivate: false,
    maxListeners: 1000,
    mood: "Chill",
    cover: "",
  });
  const [roomData, setRoomData] = useState<any>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const lastUserActionRef = useRef<number>(0);
  const playerReadyRef = useRef(false);

  // Debounced search effect
  useEffect(() => {
    const searchSongs = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await apiClient.searchYouTube(searchQuery);
        if (response.success && response.data) {
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      searchSongs();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchRoomData = async () => {
    try {
      if (!roomId || roomId === "default") {
        setRoomData({
          name: "Default Room",
          isPrivate: false,
          maxListeners: 100,
          mood: "Chill",
          hostId: "default",
        });
        setIsLoadingRoom(false);
        return;
      }

      setIsLoadingRoom(true);
      const response = await apiClient.getRoom(roomId);
      
      if (response.success && response.data) {
        setRoomData(response.data);
        setRoomSettings({
          name: response.data.name,
          listeners: response.data.listeners?.length || 0,
          isPrivate: response.data.isPrivate,
          maxListeners: response.data.maxListeners,
          mood: response.data.mood || "General",
          cover: response.data.cover || "",
        });
        
        // Check if current user is host
        const hostId = typeof response.data.hostId === 'object' ? response.data.hostId._id : response.data.hostId;
        const currentUserId = user?._id || user?.id;
        
        if (currentUserId && String(hostId) === String(currentUserId)) {
          setIsHost(true);
        } else {
            setIsHost(false);
        }
      } else {
        toast.error("Failed to load room details");
        // Fallback for demo/development
        setIsLoadingRoom(false);
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Error loading room");
    } finally {
      setIsLoadingRoom(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoomData();
    }
  }, [roomId, isAuthenticated]);

  // Socket for Chat & Presence (Player logic is in useRoomPlayer)
  const {
      chatMessages,
      listenerCount: socketListenerCount,
      roomMembers,
      emitChatMessage,
      emitPlayerPlayPause,
      emitReorderQueue,
      emitPlayerVolume,
      playerState: socketPlayerState,
      isConnected,
      emitUpdateRole,
      emitKickMember,
  } = useSocketContext();

  // useRoomPlayer Hook
  const {
    playerState,
    togglePlayPause,
    setVolume,
    seekTo,
    skipForward,
    skipBackward,
    addToQueue,
    reorderQueue,
    removeFromQueue,
    playQueueItem,
    playSong, // Exposed
    requestSong,
    approveRequest,
    rejectRequest,
    handleTimeUpdate,
    setIsBuffering,
    setIsPlaying,
    setDuration,
    toggleShuffle,
    cycleRepeatMode
  } = useRoomPlayer(roomId && roomId !== "default" ? roomId : "", user?._id || user?.id, isHost);

   const {
      isPlaying,
      currentTime,
      volume,
      currentSong,
      queue, // Now correctly from hook
      duration,
      isBuffering,
      shuffle,
      repeatMode
  } = playerState;

  // Derived state
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentVideoId = currentSong?.videoId || null;


  const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0] || "0", 10);
      const seconds = parseInt(parts[1] || "0", 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const handleSelectSong = async (song: Song) => {
    // "Play Now" logic for search results
    playSong(song);
    toast.success(`Playing ${song.title}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleQueueItemClick = (song: Song) => {
      // Play a queue item immediately
      playSong(song);
      toast.success(`Skipping to ${song.title}`);
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
    toast.success(`Added ${song.title} to queue`);
  };

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const handleSkip = (direction: "next" | "prev") => {
      if (direction === "next") skipForward();
      else skipBackward();
  };

  const handleSeek = (time: number) => {
      seekTo(time);
  };

  const handleProgressClick = (time: number) => {
      seekTo(time);
  };
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
        const oldIndex = queue.findIndex((item) => item.id === active.id);
        const newIndex = queue.findIndex((item) => item.id === over?.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
            reorderQueue(oldIndex, newIndex);
        }
    }
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
    cover?: string;
  }) => {
    try {
      const response = await apiClient.updateRoom(roomId, {
        name: settings.name,
        isPrivate: settings.isPrivate,
        maxListeners: settings.maxListeners,
        mood: settings.mood,
        cover: settings.cover,
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Determine user role and permissions
  const userRole = roomData?.roles?.[user?.id || ""] || (isHost ? "host" : "listener");
  const permissions = roomData?.permissions || {
    playPause: "everyone",
    skip: "everyone",
    volume: "everyone",
    addToQueue: "everyone"
  };

  const checkPermission = (action: "playPause" | "skip" | "seek" | "volume" | "addToQueue") => {
      if (isHost || userRole === "host") return true;
      const level = permissions[action === "seek" ? "playPause" : action]; // Seek uses playPause perm
      if (level === "everyone") return true;
      if (level === "dj" && userRole === "dj") return true;
      return false;
  };
  
  const isDJ = isHost || userRole === "dj";
  const canPlay = checkPermission("playPause");
  const canSkip = checkPermission("skip");
  const canSeek = checkPermission("seek");

  const playerProps = {
    currentSong: currentSong
      ? {
          title: currentSong.title,
          artist: currentSong.artist,
          coverUrl: currentSong.thumbnail,
        }
      : null,
    isPlaying,
    isBuffering,
    progress,
    currentTime,
    duration,
    volume,
    shuffle,
    repeatMode,
    // Add permission flags to props
    canPlay,
    canSkip,
    canSeek,
    isDJ: isHost || userRole === "dj", // For badge
    roomName: roomData?.name,
    
    onPlayPause: handlePlayPause,
    onSkipNext: () => handleSkip("next"),
    onSkipPrev: () => handleSkip("prev"),
    onShuffle: toggleShuffle,
    onRepeat: cycleRepeatMode,
    onSeek: handleSeek,
    onVolumeChange: (vol: number) => {
      setVolume(vol);
      emitPlayerVolume(vol);
    },
    onToggleMute: () => {
      const newVol = volume > 0 ? 0 : 80;
      setVolume(newVol);
      emitPlayerVolume(newVol);
    },
  };

  return (
    <AppShell playerProps={playerProps}>
      {/* Room Header / Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-primary/10 dark:from-indigo-600/30 via-background to-background p-8 pt-12 border-b border-border/50">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 relative z-10 max-w-7xl mx-auto">
            {/* Room Avatar / Icon */}
            {/* Room Avatar / Icon */}
            <div className="h-48 w-48 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 ring-1 ring-white/20 relative group overflow-hidden">
                {roomSettings.cover ? (
                  <img src={roomSettings.cover} alt={roomSettings.name} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Music className="h-20 w-20 text-white drop-shadow-lg" />
                  </>
                )}
            </div>
            
            <div className="flex flex-col gap-3 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/20">Live Room</span>
                    {roomSettings.isPrivate && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <h1 className="text-6xl font-black text-foreground tracking-tighter sm:text-7xl lg:text-8xl drop-shadow-sm dark:drop-shadow-xl">{roomSettings.name}</h1>
                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 bg-muted dark:bg-white/5 px-3 py-1.5 rounded-full border border-border dark:border-white/10">
                        <Users className="h-4 w-4 text-primary" />
                        <span><strong className="text-foreground font-bold">{socketListenerCount.toLocaleString()}</strong> listening</span>
                    </div>
                    <span className="text-muted-foreground/30 text-lg">•</span>
                    <div className="flex items-center gap-1.5 bg-muted dark:bg-white/5 px-3 py-1.5 rounded-full border border-border dark:border-white/10">
                        <span className="text-foreground font-bold">{roomSettings.mood}</span>
                    </div>
                    <span className="text-muted-foreground/30 text-lg">•</span>
                    <span className="text-muted-foreground">Host: <span className="text-foreground font-semibold">{isHost ? "You" : "The DJ"}</span></span>
                </div>
            </div>
            
             <div className="absolute top-0 right-0 p-4 flex gap-2">
                 <ThemeToggle />
                 <button onClick={handleShareRoom} className="p-2 hover:bg-accent rounded-full transition-colors text-foreground" title="Share">
                    <Share2 className="h-5 w-5" />
                 </button>
                 <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-accent rounded-full transition-colors text-foreground" title="Settings">
                    <Settings className="h-5 w-5" />
                 </button>
                 <button onClick={handleLeaveRoom} className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors" title="Leave">
                    <LogOut className="h-5 w-5" />
                 </button>
             </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
          
          {/* Left Column: Player & Queue */}
          <div className="xl:col-span-2 space-y-6">
              
              {/* Playback Actions Row */}
              <div className="flex items-center gap-6">
                  <button onClick={handlePlayPause} className="h-16 w-16 bg-primary hover:scale-105 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg shadow-primary/20 text-white group">
                      {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current pl-1" />}
                  </button>
                  <button onClick={() => setShowSearch(!showSearch)} className="px-6 py-2.5 rounded-full bg-card hover:bg-muted dark:bg-white/5 border border-border dark:border-white/10 dark:hover:bg-white/10 transition-all text-xs font-bold text-foreground tracking-widest uppercase shadow-sm">
                      {showSearch ? "Close Search" : "Add Songs"}
                  </button>
                   {isHost && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20 uppercase tracking-wider">
                            <Crown className="h-3 w-3" />
                            {userRole}
                        </div>
                   )}
              </div>

               {/* Search Overlay Inline */}
              {showSearch && (
                 <div className="bg-card backdrop-blur-xl rounded-2xl p-6 border border-border animate-in fade-in slide-in-from-top-4 shadow-xl z-20">
                    <div className="relative mb-6">
                      <Search className="text-primary absolute top-4 left-4 h-5 w-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for songs..."
                        autoFocus
                        className="w-full bg-muted text-foreground rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground transition-all border border-border"
                      />
                    </div>
                     <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {searchResults.map((song, index) => (
                        <div
                          key={`${song.id}-${index}`}
                          className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted group transition-all cursor-pointer border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-5 overflow-hidden">
                             <div className="h-14 w-14 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border shadow-inner">
                                <Music className="h-7 w-7 text-primary/60" />
                             </div>
                             <div className="truncate">
                                <p className="text-foreground font-black truncate tracking-tight text-lg">{song.title}</p>
                                <p className="text-muted-foreground text-sm truncate font-bold">{song.artist}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button
                                onClick={() => handleSelectSong(song)}
                                className="text-primary hover:text-primary/80 font-bold text-sm bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-all"
                             >
                                Play Now
                             </button>
                             <button
                                onClick={() => {
                                    if (isDJ) { // Host or DJ
                                        handleAddToQueue(song);
                                        toast.success("Added to queue");
                                    } else {
                                        requestSong(song);
                                        toast.success("Request sent to host");
                                    }
                                    setShowSearch(false);
                                }}
                                className="text-foreground hover:text-foreground/80 font-medium text-sm px-3 py-1.5 rounded-full hover:bg-muted transition-all"
                             >
                                {isDJ ? "Add" : "Request"}
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              )}

              {/* Visualizer / Video */}
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <YouTubePlayer
                    videoId={currentVideoId}
                    isPlaying={isPlaying}
                    volume={volume}
                    currentTime={currentTime}
                    onTimeUpdate={handleTimeUpdate}
                    onStateChange={(state) => {
                      if (state === 3) setIsBuffering(true);
                      else if (state === 1 || state === 2) setIsBuffering(false);
                      
                      // Auto-play next song when current one ends (State 0 is ENDED)
                      if (state === 0 && isHost) {
                        toast.info("Song ended, playing next...");
                        handleSkip("next");
                      }

                      if (!isHost) return;
                      
                      if (state === 1 && !isPlaying) {
                        setIsPlaying(true);
                        lastUserActionRef.current = Date.now();
                        emitPlayerPlayPause(true);
                      } else if (state === 2 && isPlaying) {
                        setIsPlaying(false);
                        lastUserActionRef.current = Date.now();
                        emitPlayerPlayPause(false);
                      }
                    }}
                    onReady={() => {
                      playerReadyRef.current = true;
                      // Include the sync logic here if needed or keep the original simplified
                      // For brevity, assuming basic sync or copying the block if critical
                      // Retaining essential sync:
                         if (socketPlayerState && currentVideoId) {
                            const player = (window as any).youtubePlayer;
                            if (player) {
                               const targetTime = socketPlayerState.currentTime;
                               if(Math.abs(player.getCurrentTime() - targetTime) > 2) {
                                   player.seekTo(targetTime, true);
                               }
                               if(socketPlayerState.isPlaying) {
                                   setTimeout(() => { 
                                       if(player.getPlayerState() !== 1) player.playVideo(); 
                                       setIsPlaying(true);
                                   }, 1000);
                               }
                            }
                         }
                    }}
                  />

                  {/* Waveform Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 z-20 opacity-30 dark:opacity-30 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
                     <WaveformVisualizer />
                  </div>
              </div>

              {/* Queue List (Enhanced) */}
              <div className="mt-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">Up Next</h3>
                  
                  <div className="py-2 bg-card rounded-xl border border-border">
                      {queue.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>Queue is empty</p>
                            <button onClick={() => setShowSearch(true)} className="text-primary hover:underline mt-2">Add a song</button>
                        </div>
                      ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                             <SortableContext
                                items={queue.map((s: Song) => s.id).filter((id): id is string => id !== undefined)}
                                strategy={verticalListSortingStrategy}
                             >
                                <div className="space-y-1 p-2">
                                   {queue.filter((s: Song) => s.id !== undefined).map((song: Song, i: number) => (
                                     <SortableQueueItem 
                                        key={song.id}
                                        song={song}
                                        index={i}
                                        isCurrent={currentSong?.id === song.id}
                                        onClick={handleQueueItemClick}
                                        isDJ={isDJ} // UI allows reordering if isDJ
                                     />
                                   ))}
                                </div>
                             </SortableContext>
                          </DndContext>
                      )}
                  </div>
              </div>
          </div>

          {/* Right Column: Chat/Tabs */}
          <div className="bg-card rounded-xl border border-border overflow-hidden min-h-[600px] flex flex-col">
              <RoomTabs
                 queue={queue}
                 currentSong={currentSong}
                 chatMessages={chatMessages}
                 onSendMessage={emitChatMessage}
                 currentUserId={user?._id || user?.id}
                 isConnected={isConnected}
                 roomMembers={roomMembers}
                 isHost={isHost}
                 onReorderQueue={reorderQueue}
                 requests={playerState.requests}
                 onRequestSong={requestSong}
                 onApproveRequest={approveRequest}
                 onRejectRequest={rejectRequest}
                 onRemoveSong={removeFromQueue}
                 onPlaySong={playQueueItem}
                 onUpdateRole={emitUpdateRole}
                 onKickMember={emitKickMember}
               />
          </div>
      </div>

      <RoomSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        roomName={roomSettings.name}
        isPrivate={roomSettings.isPrivate}
        maxListeners={roomSettings.maxListeners}
        cover={roomSettings.cover}
        onSave={handleSaveSettings}
      />
    </AppShell>
  );
}

