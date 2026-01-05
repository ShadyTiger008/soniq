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
          className={`glass-card smooth-transition p-3 ${!canSkip ? 'opacity-50 cursor-not-allowed' : 'hover:border-deep-purple'}`}
          title="Previous"
        >
          <SkipBack className="text-ocean-blue h-5 w-5" />
        </button>

        <button
          onClick={() => {
              if(canPlay) onPlayPause?.();
          }}
          disabled={!canPlay}
          className={`from-deep-purple to-electric-magenta neon-glow smooth-transition rounded-full bg-gradient-to-r p-4 ${!canPlay ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-electric-magenta hover:to-neon-pink'}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="text-soft-white h-6 w-6 fill-current" />
          ) : (
            <Play className="text-soft-white ml-1 h-6 w-6 fill-current" />
          )}
        </button>

        <button
          onClick={() => onSkip?.("next")}
          disabled={!canSkip}
          className={`glass-card smooth-transition p-3 ${!canSkip ? 'opacity-50 cursor-not-allowed' : 'hover:border-ocean-blue'}`}
          title="Next"
        >
          <SkipForward className="text-neon-cyan h-5 w-5" />
        </button>
      </div>

      {/* Secondary controls - DJ only */}
      {isDJ && (
        <div className="mb-6 flex items-center justify-center gap-4 border-b border-[rgba(108,43,217,0.2)] pb-4">
          <button
            onClick={() => onSeek?.(-5)}
            className="glass-card hover:border-ocean-blue smooth-transition px-3 py-2 text-sm"
            title="Rewind 5 seconds"
          >
            -5s
          </button>
          <button
            onClick={() => onSeek?.(5)}
            className="glass-card hover:border-electric-magenta smooth-transition px-3 py-2 text-sm"
            title="Forward 5 seconds"
          >
            +5s
          </button>
          <button
            onClick={() => onSeek?.(10)}
            className="glass-card hover:border-neon-cyan smooth-transition px-3 py-2 text-sm"
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
            className="smooth-transition text-muted-foreground hover:text-soft-white"
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
            className="accent-electric-magenta h-1 w-24 cursor-pointer appearance-none rounded-full bg-[rgba(108,43,217,0.2)]"
            title={`Volume: ${volume}%`}
          />
          <span className="text-muted-foreground w-8 text-xs">{volume}</span>
        </div>

        <div className="flex items-center gap-3">
          {isDJ && (
            <div className="border-electric-magenta/30 flex items-center gap-1 rounded-full border bg-[rgba(214,93,242,0.1)] px-3 py-1">
              <Crown className="text-electric-magenta h-4 w-4" />
              <span className="text-electric-magenta font-500 text-xs">
                DJ Mode
              </span>
            </div>
          )}
          <button
            onClick={() => alert("Share feature coming soon!")}
            className="smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)]"
            title="Share"
          >
            <Share2 className="text-muted-foreground hover:text-soft-white h-4 w-4" />
          </button>
          <button
            onClick={() => alert("Settings coming soon!")}
            className="smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)]"
            title="Settings"
          >
            <Settings className="text-muted-foreground hover:text-soft-white h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const player = document.querySelector(".aspect-video");
              if (player) {
                player.requestFullscreen?.();
              }
            }}
            className="smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)]"
            title="Fullscreen"
          >
            <Maximize2 className="text-muted-foreground hover:text-soft-white h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
