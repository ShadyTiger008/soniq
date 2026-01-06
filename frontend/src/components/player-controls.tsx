"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Share2,
  Crown,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface PlayerControlsProps {
  isPlaying?: boolean;
  isDJ?: boolean; // Used for badge/admin styling
  canPlay?: boolean; // Permission to play/pause
  canSkip?: boolean; // Permission to skip
  canSeek?: boolean; // Permission to seek
  volume?: number;
  currentTime?: number;
  duration?: number;
  progress?: number;
  onPlayPause?: () => void;
  onSkip?: (direction: "prev" | "next") => void;
  onSeek?: (amount: number) => void;
  onVolumeChange?: (volume: number) => void;
  onProgressClick?: (time: number) => void;
}

export function PlayerControls({
  isPlaying = false,
  isDJ = false,
  canPlay = true, // Default to true if not specified
  canSkip = true,
  canSeek = true,
  volume = 80,
  currentTime = 0,
  duration = 0,
  progress = 0,
  onPlayPause,
  onSkip,
  onSeek,
  onVolumeChange,
  onProgressClick,
}: PlayerControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange?.(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange?.(0);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value);
    onVolumeChange?.(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const calculateProgressFromClick = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!progressBarRef.current || !duration || !canSeek) return null;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage;
  }, [duration, canSeek]);

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canSeek || !duration) return;
    setIsDragging(true);
    const percentage = calculateProgressFromClick(e);
    if (percentage !== null) {
      setDragProgress(percentage * 100);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const percentage = calculateProgressFromClick(e);
      if (percentage !== null) {
        setDragProgress(percentage * 100);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const percentage = calculateProgressFromClick(e);
      if (percentage !== null && onProgressClick) {
        onProgressClick(percentage * duration);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, calculateProgressFromClick, duration, onProgressClick]);

  const displayProgress = isDragging ? dragProgress : progress;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-4">
        <div
          ref={progressBarRef}
          className={`group relative h-2 overflow-hidden rounded-full bg-primary/20 ${canSeek ? "cursor-pointer" : "cursor-default"}`}
          onMouseDown={handleProgressBarMouseDown}
        >
          <div
            className="from-primary to-primary/60 absolute h-full rounded-full bg-gradient-to-r transition-all"
            style={{ width: `${displayProgress}%` }}
          />
          {canSeek && (
            <div
              className={`bg-primary shadow-primary/50 smooth-transition absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full shadow-lg ${isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'}`}
              style={{ left: `calc(${displayProgress}% - 8px)` }}
            />
          )}
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main controls */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <button
          onClick={() => onSkip?.("prev")}
          disabled={!canSkip}
          className={`bg-card border border-border smooth-transition rounded-xl p-3 ${!canSkip ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
          title="Previous"
        >
          <SkipBack className="text-primary h-5 w-5" />
        </button>

        <button
          onClick={() => {
              if(canPlay) onPlayPause?.();
          }}
          disabled={!canPlay}
          className={`bg-gradient-to-r from-primary to-electric-magenta shadow-lg shadow-primary/20 smooth-transition rounded-full p-4 ${!canPlay ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="text-white h-6 w-6 fill-current" />
          ) : (
            <Play className="text-white ml-1 h-6 w-6 fill-current" />
          )}
        </button>

        <button
          onClick={() => onSkip?.("next")}
          disabled={!canSkip}
          className={`bg-card border border-border smooth-transition rounded-xl p-3 ${!canSkip ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
          title="Next"
        >
          <SkipForward className="text-primary h-5 w-5" />
        </button>
      </div>

      {/* Secondary controls - DJ only */}
      {isDJ && (
        <div className="mb-6 flex items-center justify-center gap-4 border-b border-border pb-4">
          <button
            onClick={() => onSeek?.(-5)}
            className="border border-border bg-muted/30 hover:bg-muted font-medium smooth-transition rounded-lg px-3 py-2 text-sm text-foreground"
            title="Rewind 5 seconds"
          >
            -5s
          </button>
          <button
            onClick={() => onSeek?.(5)}
            className="border border-border bg-muted/30 hover:bg-muted font-medium smooth-transition rounded-lg px-3 py-2 text-sm text-foreground"
            title="Forward 5 seconds"
          >
            +5s
          </button>
          <button
            onClick={() => onSeek?.(10)}
            className="border border-border bg-muted/30 hover:bg-muted font-medium smooth-transition rounded-lg px-3 py-2 text-sm text-foreground"
            title="Forward 10 seconds"
          >
            +10s
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMuteToggle}
            className="smooth-transition text-muted-foreground hover:text-foreground"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="accent-primary h-1 w-24 cursor-pointer appearance-none rounded-full bg-muted"
            title={`Volume: ${volume}%`}
          />
          <span className="text-muted-foreground w-8 text-xs font-medium">{volume}</span>
        </div>

        <div className="flex items-center gap-3">
          {isDJ && (
            <div className="border-primary/30 flex items-center gap-1 rounded-full border bg-primary/10 px-3 py-1">
              <Crown className="text-primary h-4 w-4" />
              <span className="text-primary font-600 text-xs">
                DJ Mode
              </span>
            </div>
          )}
          <button
            onClick={() => alert("Share feature coming soon!")}
            className="smooth-transition rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => alert("Settings coming soon!")}
            className="smooth-transition rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const player = document.querySelector(".aspect-video");
              if (player) {
                player.requestFullscreen?.();
              }
            }}
            className="smooth-transition rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
