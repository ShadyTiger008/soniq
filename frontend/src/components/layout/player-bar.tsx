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
}: PlayerBarProps) {
  
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-card border-t border-border px-4 flex items-center justify-between z-50 text-foreground shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-none">
      {/* 1. Left: Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        {currentSong ? (
            <>
                <div className="h-14 w-14 bg-muted rounded shadow-md flex items-center justify-center shrink-0 overflow-hidden relative group">
                    {currentSong.coverUrl ? (
                        <Image src={currentSong.coverUrl} alt={currentSong.title} fill className="object-cover" />
                    ) : (
                        <ListMusic className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                    <p className="font-semibold text-sm text-foreground truncate hover:underline cursor-pointer">
                        {currentSong.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <span className="hover:text-foreground hover:underline cursor-pointer transition-colors max-w-[150px] truncate">
                           {currentSong.artist}
                        </span>
                        {roomName && (
                            <>
                                <span>•</span>
                                <span className="text-primary font-bold truncate max-w-[100px]">
                                    {roomName}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </>
        ) : (
             <div className="flex flex-col justify-center">
                 <div className="h-14 w-1 flex items-center text-xs text-muted-foreground italic font-medium">
                    No song playing
                 </div>
                 {roomName && (
                    <div className="text-xs text-primary font-bold uppercase tracking-wider">
                        {roomName}
                    </div>
                 )}
             </div>
        )}
      </div>

      {/* 2. Center: Controls & Progress */}
      <div className="flex flex-col items-center justify-center max-w-[722px] w-[40%] gap-2">
        <div className="flex items-center gap-4">
             <button 
                onClick={onShuffle}
                className={cn(
                    "transition-colors",
                    shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )} 
                title={shuffle ? "Disable Shuffle" : "Enable Shuffle"}
             >
                <Shuffle className="h-4 w-4" />
             </button>
             <button 
                onClick={() => canSkip && onSkipPrev?.()}
                className={`transition-colors ${canSkip ? "text-muted-foreground hover:text-foreground" : "text-border cursor-not-allowed"}`}
                disabled={!canSkip}
             >
                <SkipBack className="h-5 w-5 fill-current" />
             </button>
             
             <button 
                onClick={() => canPlay && onPlayPause?.()}
                className={`bg-foreground text-background dark:bg-white dark:text-black rounded-full p-2.5 shadow-md transition-all active:scale-95 flex items-center justify-center ${canPlay ? "hover:scale-110" : "opacity-30 cursor-not-allowed hover:scale-100"}`}
                disabled={!canPlay}
             >
                {isPlaying ? (
                     <Pause className="h-5 w-5 fill-current" />
                ) : (
                     <Play className="h-5 w-5 fill-current pl-0.5" />
                )}
             </button>

             <button 
                onClick={() => canSkip && onSkipNext?.()}
                className={`transition-colors ${canSkip ? "text-muted-foreground hover:text-foreground" : "text-border cursor-not-allowed"}`}
                disabled={!canSkip}
             >
                <SkipForward className="h-5 w-5 fill-current" />
             </button>
             <button 
                onClick={onRepeat}
                className={cn(
                    "transition-colors relative",
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
        
        <div className="w-full flex items-center gap-2 text-[10px] font-bold tracking-tighter text-muted-foreground tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <div className={`relative h-1 bg-muted rounded-full w-full group ${canSeek ? "cursor-pointer" : "cursor-default"}`}>
                 <div 
                    className={`absolute h-full bg-foreground dark:bg-white rounded-full ${canSeek ? "group-hover:bg-primary" : "opacity-50"}`}
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
            <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right: Volume & Extras */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[180px]">
         <button className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105" title="Lyrics">
            <Mic2 className="h-4 w-4" />
         </button>
         <button className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105" title="Queue">
            <LayoutList className="h-4 w-4" />
         </button>
         
         <div className="flex items-center gap-2 w-28 group">
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
         
         <button className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105" title="Full Screen">
            <Maximize2 className="h-4 w-4" />
         </button>
      </div>
    </div>
  );
}
