"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Mic2,
  LayoutList,
  Maximize2,
  ListMusic
} from "lucide-react";
import * as React from "react";
import Image from "next/image";
import { cn } from "@frontend/lib/utils";

interface PlayerBarProps {
  currentSong?: {
    title: string;
    artist: string;
    coverUrl?: string; // If we have album art
  } | null;
  isPlaying?: boolean;
  isBuffering?: boolean;
  progress?: number; // 0-100
  currentTime?: number;
  duration?: number;
  volume?: number;
  isMuted?: boolean;
  onPlayPause?: () => void;
  onSkipNext?: () => void;
  onSkipPrev?: () => void;
  onSeek?: (value: number) => void;
  onVolumeChange?: (value: number) => void;
  onToggleMute?: () => void;
  canPlay?: boolean;
  canSkip?: boolean;
  canSeek?: boolean;
  roomName?: string;
  shuffle?: boolean;
  repeatMode?: 'none' | 'one' | 'all';
  onShuffle?: () => void;
  onRepeat?: () => void;
  onToggleLyrics?: () => void;
  onToggleQueue?: () => void;
  onToggleFullscreen?: () => void;
}

export function PlayerBar({
  currentSong,
  isPlaying = false,
  isBuffering = false,
  progress = 0,
  currentTime = 0,
  duration = 0,
  volume = 80,
  isMuted = false,
  onPlayPause,
  onSkipNext,
  onSkipPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  canPlay = true,
  canSkip = true,
  canSeek = true,
  roomName,
  shuffle = false,
  repeatMode = 'none',
  onShuffle,
  onRepeat,
  onToggleLyrics,
  onToggleQueue,
  onToggleFullscreen,
}: PlayerBarProps) {
  
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full w-full flex items-center justify-between px-4 text-foreground transition-all duration-300">
      {/* 1. Left: Track Info */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0 md:w-[25%] lg:w-[20%]">
        {currentSong ? (
            <>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-muted rounded shadow-md flex items-center justify-center shrink-0 overflow-hidden relative group">
                    {currentSong.coverUrl ? (
                        <Image src={currentSong.coverUrl} alt={currentSong.title} fill className="object-cover" />
                    ) : (
                        <ListMusic className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                    )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                    <p className="font-semibold text-xs md:text-sm text-foreground truncate hover:underline cursor-pointer">
                        {currentSong.title}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground truncate">
                        <span className="hover:text-foreground hover:underline cursor-pointer transition-colors truncate">
                           {currentSong.artist}
                        </span>
                        {roomName && (
                            <>
                                <span className="hidden xs:inline">•</span>
                                <span className="text-primary font-bold truncate hidden xs:inline">
                                    {roomName}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </>
        ) : (
             <div className="flex flex-col justify-center min-w-0">
                 <div className="h-12 w-auto flex items-center text-xs text-muted-foreground italic font-medium truncate">
                    No song playing
                 </div>
                 {roomName && (
                    <div className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-wider truncate">
                        {roomName}
                    </div>
                 )}
             </div>
        )}
      </div>

      {/* 2. Center: Controls & Progress */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 md:gap-2 px-4 md:px-8 min-w-0">
        <div className="flex items-center gap-4 md:gap-6">
             <button 
                onClick={onShuffle}
                className={cn(
                    "transition-colors hidden sm:block",
                    shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )} 
                title={shuffle ? "Disable Shuffle" : "Enable Shuffle"}
             >
                <Shuffle className="h-4 w-4" />
             </button>
             <button 
                onClick={() => canSkip && onSkipPrev?.()}
                className={`transition-colors flex items-center justify-center ${canSkip ? "text-muted-foreground hover:text-foreground" : "text-border cursor-not-allowed"}`}
                disabled={!canSkip}
             >
                <SkipBack className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </button>
             
             <button 
                onClick={() => canPlay && onPlayPause?.()}
                className={`bg-foreground text-background dark:bg-white dark:text-black rounded-full p-2 md:p-2.5 shadow-md transition-all active:scale-95 flex items-center justify-center ${canPlay ? "hover:scale-110" : "opacity-30 cursor-not-allowed hover:scale-100"}`}
                disabled={!canPlay}
             >
                {isPlaying ? (
                     <Pause className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                ) : (
                     <Play className="h-4 w-4 md:h-5 md:w-5 fill-current pl-0.5" />
                )}
             </button>

             <button 
                onClick={() => canSkip && onSkipNext?.()}
                className={`transition-colors flex items-center justify-center ${canSkip ? "text-muted-foreground hover:text-foreground" : "text-border cursor-not-allowed"}`}
                disabled={!canSkip}
             >
                <SkipForward className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </button>
             <button 
                onClick={onRepeat}
                className={cn(
                    "transition-colors relative hidden sm:block",
                    repeatMode !== 'none' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )} 
                title={`Repeat: ${repeatMode}`}
             >
                <Repeat className="h-4 w-4" />
                {repeatMode === 'one' && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-white rounded-full w-2.5 h-2.5 flex items-center justify-center font-bold">1</span>
                )}
             </button>
        </div>
        
        <div className="w-full flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-bold tracking-tighter text-muted-foreground tabular-nums">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className={`relative h-1 bg-muted rounded-full flex-1 group ${canSeek ? "cursor-pointer" : "cursor-default"}`}>
                 <div 
                    className={`absolute h-full bg-primary md:bg-foreground md:dark:bg-white rounded-full ${canSeek ? "group-hover:bg-primary" : "opacity-50"}`}
                    style={{ width: `${progress}%` }}
                 />
                 <input 
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => canSeek && onSeek?.(Number(e.target.value))}
                    disabled={!canSeek}
                    className={`absolute inset-0 w-full h-full opacity-0 ${canSeek ? "cursor-pointer" : "cursor-default"}`}
                 />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right: Volume & Extras */}
      <div className="hidden xs:flex items-center justify-end gap-2 md:gap-4 md:w-[25%] lg:w-[20%]">
         <button 
            onClick={onToggleLyrics}
            className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105 hidden sm:block" 
            title="Lyrics"
         >
            <Mic2 className="h-4 w-4" />
         </button>
         <button 
            onClick={onToggleQueue}
            className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105" 
            title="Queue"
         >
            <LayoutList className="h-4 w-4" />
         </button>
         
         <div className="hidden sm:flex items-center gap-2 w-20 md:w-24 lg:w-28 group">
            <button onClick={onToggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="h-1 bg-muted rounded-full w-full relative">
                 <div 
                    className="absolute h-full bg-foreground dark:bg-white rounded-full group-hover:bg-primary"
                    style={{ width: `${volume}%` }}
                 />
                 <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => onVolumeChange?.(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
            </div>
         </div>
         
         <button 
            onClick={onToggleFullscreen}
            className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105" 
            title="Full Screen"
         >
            <Maximize2 className="h-4 w-4" />
         </button>
      </div>
    </div>
  );
}
