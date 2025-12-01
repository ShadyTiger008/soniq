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
import { WaveformVisualizer } from "~/components/waveform-visualizer";
import { PlayerControls } from "~/components/player-controls";
import { RoomTabs } from "~/components/room-tabs";
import { YouTubePlayer, extractVideoId } from "~/components/youtube-player";
import { RoomSettingsModal } from "~/components/room-settings-modal";
import { useAuth } from "~/lib/auth-context";
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
  const [isDJ] = useState(true);
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

  // Dummy YouTube search
  const searchYouTube = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const dummyResults: Song[] = [
      {
        id: `result-1`,
        videoId: "dQw4w9WgXcQ",
        title: `${query} - Song 1`,
        artist: "Artist 1",
        duration: "3:45",
      },
      {
        id: `result-2`,
        videoId: "kJQP7kiw5Fk",
        title: `${query} - Song 2`,
        artist: "Artist 2",
        duration: "4:12",
      },
      {
        id: `result-3`,
        videoId: "9bZkp7q19f0",
        title: `${query} - Song 3`,
        artist: "Artist 3",
        duration: "3:28",
      },
    ];

    setSearchResults(dummyResults);
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
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (direction: "prev" | "next") => {
    if (direction === "next" && queue.length > 0) {
      const nextSong = queue[0];
      if (nextSong) {
        setCurrentSong(nextSong);
        setCurrentVideoId(nextSong.videoId);
        setQueue(queue.slice(1));
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (amount: number) => {
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
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleTimeUpdate = (time: number, totalDuration: number) => {
    setCurrentTime(time);
    setDuration(totalDuration);
    if (totalDuration > 0) {
      setProgress((time / totalDuration) * 100);
    }
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setCurrentVideoId(song.videoId);
    setIsPlaying(true);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleAddToQueue = (song: Song) => {
    setQueue([...queue, song]);
    setShowSearch(false);
    setSearchQuery("");
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

  const handleLeaveRoom = () => {
    if (confirm("Are you sure you want to leave this room?")) {
      router.push("/home");
    }
  };

  const handleSaveSettings = (settings: {
    name: string;
    isPrivate: boolean;
    maxListeners: number;
    mood: string;
  }) => {
    setRoomSettings({
      ...roomSettings,
      name: settings.name,
      isPrivate: settings.isPrivate,
      maxListeners: settings.maxListeners,
      mood: settings.mood,
    });
    alert("Room settings saved successfully!");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/room/${roomId}`);
    }
  }, [isAuthenticated, router, roomId]);

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
                  if (state === 1) setIsPlaying(true);
                  else if (state === 2) setIsPlaying(false);
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
              onVolumeChange={setVolume}
              onProgressClick={handleProgressClick}
            />
          </div>

          {/* Waveform visualizer */}
          <div className="glass-card h-40 overflow-hidden rounded-2xl border-2 border-deep-purple/20">
            <WaveformVisualizer />
          </div>

          {/* Tabs section - Fixed height with proper overflow */}
          <div className="glass-card min-h-[500px] overflow-hidden rounded-2xl border-2 border-deep-purple/20">
            <RoomTabs queue={queue} currentSong={currentSong} />
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
