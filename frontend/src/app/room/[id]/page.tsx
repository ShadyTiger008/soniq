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
  GripVertical,
  Radio,
  Flame,
  Sparkles
} from "lucide-react";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
import { motion, AnimatePresence } from "framer-motion";

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
import { LeaveRoomModal } from "@frontend/components/leave-room-modal";

// Sortable Item Wrapper
function SortableQueueItem({ song, index, isCurrent, onClick, isDJ }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: song.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <motion.div 
            ref={setNodeRef} 
            style={style} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group mb-2"
        >
            <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border",
                 isCurrent 
                    ? "bg-primary/10 border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                    : "bg-surface-high/40 hover:bg-surface-highest/60 border-white/5 hover:border-white/10"
            )}>
                 {/* Drag Handle */}
                 {isDJ && (
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-primary text-muted-foreground transition-colors p-1 -ml-1">
                        <GripVertical className="h-4 w-4" />
                    </div>
                 )}
                 {!isDJ && (
                    <div className="text-muted-foreground/40 w-4 text-center text-[10px] font-black">{index + 1}</div>
                 )}
                
                 {/* Clickable Area for Play */}
                 <div className="flex-1 min-w-0 flex items-center gap-4 cursor-pointer" onClick={() => onClick(song)}>
                     <div className="h-12 w-12 rounded-xl bg-surface-highest flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform shadow-lg">
                        {song.thumbnail ? (
                            <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" /> 
                        ) : <Music className="h-5 w-5 text-muted-foreground" />}
                        {isCurrent && (
                            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                <Radio className="h-5 w-5 text-white animate-pulse" />
                            </div>
                        )}
                     </div>
                      <div className="flex-1 min-w-0">
                         <p className={cn(
                             "font-bold truncate tracking-tight text-sm",
                             isCurrent ? 'text-primary' : 'text-white'
                         )}>
                             {song.title}
                         </p>
                         <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{song.artist}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-[10px] font-black text-muted-foreground/60 block mb-1 uppercase tracking-wider">{song.duration}</span>
                        <div className="flex items-center justify-end gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                            <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground/40 font-black">REQ BY</span>
                            <span className="text-[8px] uppercase tracking-[0.1em] text-primary/60 font-black">{song.requestedBy}</span>
                        </div>
                      </div>
                 </div>
            </div>
        </motion.div>
    );
}

// Helper inside file
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "queue" | "members" | "now-playing">("chat");
  const [showLyrics, setShowLyrics] = useState(false);

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
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
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
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = async (deleteRoom: boolean) => {
    try {
      await apiClient.leaveRoom(roomId, deleteRoom);
      toast.success(
        deleteRoom ? "Room deleted successfully" : "Left room successfully"
      );
      router.push("/home");
    } catch (error) {
      toast.error("Failed to leave room");
      router.push("/home");
    } finally {
      setShowLeaveModal(false);
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

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleToggleQueue = () => {
    setActiveTab("queue");
    // Scroll to the right column on mobile if needed
    const rightCol = document.getElementById("right-tabs-column");
    if (rightCol && window.innerWidth < 1280) {
      rightCol.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToggleLyrics = () => {
    setShowLyrics(!showLyrics);
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
    onToggleLyrics: handleToggleLyrics,
    onToggleQueue: handleToggleQueue,
    onToggleFullscreen: handleToggleFullscreen,
  };

  return (
    <AppShell playerProps={playerProps}>
      {/* Room Hero - Cinematic Editorial Header */}
      <div className="relative w-full min-h-[40vh] flex items-end justify-center overflow-hidden">
        {/* Cinematic Ambient Background */}
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(var(--primary-rgb),0.15)_0%,_transparent_50%)] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(var(--primary-rgb),0.1)_0%,_transparent_60%)] z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />

        <div className="w-full max-w-7xl mx-auto px-8 pb-12 relative z-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            {/* High-Fidelity Room Cover */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="h-64 w-64 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-3xl bg-surface-highest flex items-center justify-center shrink-0 ring-1 ring-white/10 relative group overflow-hidden"
            >
                {roomSettings.cover ? (
                  <img src={roomSettings.cover} alt={roomSettings.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-primary/20 via-primary/40 to-primary/20 flex items-center justify-center">
                    <Music className="h-24 w-24 text-white drop-shadow-2xl" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                <div className="absolute inset-0 border-[0.5px] border-white/20 rounded-3xl pointer-events-none" />
            </motion.div>
            
            <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center md:justify-start gap-4"
                >
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Live Session</span>
                    </div>
                    {roomSettings.isPrivate && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Private</span>
                      </div>
                    )}
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-7xl font-black text-white tracking-tighter sm:text-8xl lg:text-9xl font-epilogue"
                >
                  {roomSettings.name}
                </motion.h1>

                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.2 }}
                   className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm"
                >
                    <div className="flex items-center gap-2 text-muted-foreground font-bold bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                        <Users className="h-4 w-4 text-primary" />
                        <span><strong className="text-white font-black">{socketListenerCount.toLocaleString()}</strong> <span className="opacity-60">tuning in</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-white font-black uppercase tracking-widest text-[10px]">{roomSettings.mood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold px-1">
                        <span className="opacity-40 uppercase text-[10px] tracking-widest">Directed by</span>
                        <span className="text-white font-black">{isHost ? "You" : "The DJ"}</span>
                    </div>
                </motion.div>
            </div>
            
            {/* Header Actions */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex md:flex-col gap-2 p-4"
            >
                 <div className="flex gap-2 mb-2">
                    <button onClick={handleCopyInvite} className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white" title="Copy Invite">
                        {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                    <button onClick={handleShareRoom} className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white" title="Share Space">
                        <Share2 className="h-5 w-5" />
                    </button>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setShowSettings(true)} className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white" title="Settings">
                        <Settings className="h-5 w-5" />
                    </button>
                    <button onClick={handleLeaveRoom} className="h-12 w-12 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl border border-rose-500/20 transition-all text-rose-500" title="Exit Room">
                        <LogOut className="h-5 w-5" />
                    </button>
                 </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 xl:grid-cols-3 gap-12 relative z-10">
          
          {/* Left Column: Player & Queue */}
          <div className="xl:col-span-2 flex flex-col gap-10">
              
              {/* Playback Actions Row */}
              <div className="flex items-center gap-8">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayPause} 
                    className="h-20 w-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] text-white relative group overflow-hidden"
                  >
                      <motion.div 
                        animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                      {isPlaying ? <Pause className="h-10 w-10 fill-current relative z-10" /> : <Play className="h-10 w-10 fill-current pl-1 relative z-10" />}
                  </motion.button>

                  <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => setShowSearch(!showSearch)} 
                        className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-surface-high hover:bg-surface-highest border border-white/5 hover:border-primary/30 transition-all text-[10px] font-black text-white tracking-[0.2em] uppercase shadow-lg"
                      >
                          <Search className="h-4 w-4 text-primary" />
                          {showSearch ? "Close Search" : "Enhance Queue"}
                      </button>
                      {isHost && (
                           <div className="flex items-center gap-2 px-3 py-1 mt-1 opacity-60">
                               <Crown className="h-3 w-3 text-primary" />
                               <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Master Control Active</span>
                           </div>
                      )}
                  </div>
              </div>

               {/* Search Overlay Inline - Premium Glassmorphism */}
              <AnimatePresence>
                {showSearch && (
                   <motion.div 
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="bg-surface-high/80 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] z-50 overflow-hidden relative"
                   >
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      
                      <div className="relative mb-8">
                        <Search className="text-primary absolute top-1/2 -translate-y-1/2 left-6 h-5 w-5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="What's the next anthem?"
                          autoFocus
                          className="w-full bg-black/40 text-white rounded-2xl py-5 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/40 transition-all border border-white/5 text-lg font-bold"
                        />
                      </div>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {searchResults.length > 0 ? searchResults.map((song, index) => (
                          <motion.div
                            key={`${song.id}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 group transition-all cursor-pointer border border-transparent hover:border-white/5"
                          >
                            <div className="flex items-center gap-5 overflow-hidden">
                               <div className="h-14 w-14 bg-surface-highest rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner relative overflow-hidden">
                                  {song.thumbnail ? (
                                    <img src={song.thumbnail} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  ) : <Music className="h-7 w-7 text-primary/40" />}
                               </div>
                               <div className="truncate">
                                  <p className="text-white font-black truncate tracking-tight text-base group-hover:text-primary transition-colors">{song.title}</p>
                                  <p className="text-muted-foreground text-xs truncate font-bold uppercase tracking-widest mt-1 opacity-60">{song.artist}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSelectSong(song)}
                                  className="text-white font-black text-[10px] uppercase tracking-widest bg-primary/20 hover:bg-primary/40 px-4 py-2 rounded-xl transition-all border border-primary/20"
                               >
                                  Play
                               </motion.button>
                               <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                      if (isDJ) {
                                          handleAddToQueue(song);
                                      } else {
                                          requestSong(song);
                                          toast.success("Vibe request sent");
                                      }
                                      setShowSearch(false);
                                  }}
                                  className="text-white font-black text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5"
                               >
                                  {isDJ ? "Add" : "Request"}
                               </motion.button>
                            </div>
                          </motion.div>
                        )) : (
                          <div className="py-12 text-center">
                            <Flame className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Search for any track in the universe</p>
                          </div>
                        )}
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              {/* Visualizer / Video - Cinematic Container */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative group ring-1 ring-white/10"
              >
                  <YouTubePlayer
                    videoId={currentVideoId}
                    isPlaying={isPlaying}
                    volume={volume}
                    currentTime={currentTime}
                    onTimeUpdate={handleTimeUpdate}
                    onStateChange={(state) => {
                      if (state === 3) setIsBuffering(true);
                      else if (state === 1 || state === 2) setIsBuffering(false);
                      if (state === 0 && isHost) {
                        toast.info("Transitioning to next track...");
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

                  {/* Ambient Lighting Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none opacity-60" />
                  
                  {/* Waveform Visualization */}
                  <div className="absolute bottom-6 left-8 right-8 h-16 z-20 pointer-events-none mix-blend-screen opacity-40">
                     <WaveformVisualizer />
                  </div>
              </motion.div>

              {/* Queue List (Editorial Grade) */}
              <div className="mt-12">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-white tracking-widest uppercase">The Lineup</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{queue.length} Tracks</span>
                  </div>
                  
                  <div className="relative">
                      {queue.length === 0 ? (
                        <div className="py-20 text-center bg-surface-high/20 rounded-[2rem] border border-dashed border-white/10">
                            <Music className="h-12 w-12 text-white/10 mx-auto mb-4" />
                            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Queue is currently silent</p>
                            <button onClick={() => setShowSearch(true)} className="text-primary hover:text-white transition-colors mt-4 text-[10px] font-black uppercase tracking-widest bg-primary/10 px-6 py-2 rounded-xl">Ignite the Vibe</button>
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
                                <motion.div 
                                    initial="hidden"
                                    animate="show"
                                    variants={{
                                        show: { transition: { staggerChildren: 0.1 } }
                                    }}
                                    className="space-y-3"
                                >
                                   {queue.filter((s: Song) => s.id !== undefined).map((song: Song, i: number) => (
                                     <SortableQueueItem 
                                        key={song.id}
                                        song={song}
                                        index={i}
                                        isCurrent={currentSong?.id === song.id}
                                        onClick={handleQueueItemClick}
                                        isDJ={isDJ}
                                     />
                                   ))}
                                </motion.div>
                             </SortableContext>
                          </DndContext>
                      )}
                  </div>
              </div>
          </div>

          {/* Right Column: Chat/Tabs Container */}
          <motion.div 
            id="right-tabs-column" 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-low border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[700px] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.3)] sticky top-8"
          >
              <RoomTabs
                 activeTab={activeTab}
                 onTabChange={(tab: any) => setActiveTab(tab)}
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
          </motion.div>
      </div>

      <RoomSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        roomName={roomSettings.name}
        isPrivate={roomSettings.isPrivate}
        maxListeners={roomSettings.maxListeners}
        mood={roomSettings.mood}
        cover={roomSettings.cover}
        stats={{
          totalListeners: socketListenerCount,
          createdAt: roomData?.createdAt
        }}
        onSave={handleSaveSettings}
      />

      <LeaveRoomModal 
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        isHost={isHost}
        onConfirm={handleConfirmLeave}
      />

      {/* Lyrics Overlay */}
      {showLyrics && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <button 
                onClick={() => setShowLyrics(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                title="Close"
            >
                <X className="h-8 w-8" />
            </button>
            <div className="max-w-2xl w-full text-center space-y-8 overflow-y-auto max-h-[80vh] scrollbar-hide px-4">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        {currentSong?.title || "No Song Playing"}
                    </h2>
                    <p className="text-xl text-primary font-bold uppercase tracking-widest">{currentSong?.artist}</p>
                </div>
                
                <div className="space-y-6 text-2xl md:text-3xl font-medium text-white/70 leading-relaxed italic">
                    {/* Mock Lyrics - In a real app, these would come from an API */}
                    <p className="text-white scale-110">This is where the magic happens</p>
                    <p>When the bass drops low</p>
                    <p>And the rhythm starts to flow</p>
                    <p>SONIQ brings the vibe alive</p>
                    <p>In the digital night, we thrive</p>
                    <p className="text-white/40 text-lg not-italic mt-12">Lyrics are currently in beta</p>
                </div>
            </div>
        </div>
      )}
    </AppShell>
  );
}

