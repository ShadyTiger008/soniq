"use client";

import { Grip, Trash2, Music, Play } from "lucide-react";
import { useState } from "react";

interface QueueSongItemProps {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
  requestedBy: string;
  requestedByRole?: string;
  isDragging?: boolean;
  isDJ?: boolean;
  isNow?: boolean;
  isOwn?: boolean;
  onRemove?: () => void;
  onPlay?: () => void;
}

export function QueueSongItem({
  id,
  title,
  artist,
  duration,
  thumbnail,
  requestedBy,
  requestedByRole,
  isDJ = false,
  isNow = false,
  isOwn = false,
  onRemove,
  onPlay,
}: QueueSongItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group hover:bg-muted/50 smooth-transition flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border/50 ${
        isNow ? "bg-primary/5 dark:bg-primary/10 border-primary/20" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Drag handle (DJ only) */}
        {isDJ && (
          <Grip className="text-muted-foreground group-hover:text-primary h-4 w-4 flex-shrink-0 cursor-grab transition-colors" />
        )}

        {/* Thumbnail */}
        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm border border-border">
          {thumbnail ? (
            <img
              src={thumbnail || "/placeholder.svg"}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
               <Music className="h-5 w-5" />
            </div>
          )}
          {isNow && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
               <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Play className="text-white h-3 w-3 fill-current ml-0.5" />
               </div>
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="min-w-0 flex-1">
          <p
            className={`font-bold truncate text-sm tracking-tight ${isNow ? "text-primary" : "text-foreground"}`}
          >
            {title}
          </p>
          <div className="text-muted-foreground flex items-center gap-2 truncate text-[10px] font-bold uppercase tracking-tight tabular-nums">
            <span className="truncate">{artist}</span>
            <span className="opacity-30">•</span>
            <span className="flex-shrink-0">{duration}</span>
          </div>
        </div>

        {/* Requested by */}
        <div className="flex-shrink-0 text-right pr-2">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{requestedBy}</p>
          {requestedByRole && (
            <p className="text-primary font-black text-[9px] uppercase tracking-[0.15em] mt-0.5">
              {requestedByRole}
            </p>
          )}
        </div>
      </div>

      {/* Actions (DJ only) */}
      {(isDJ || isOwn) && isHovered && (
        <div className="flex items-center gap-1 ml-2">
            {!isNow && onPlay && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPlay(); }}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 smooth-transition flex-shrink-0 rounded-full p-2"
                  title="Play Now"
                >
                    <Play className="h-4 w-4 fill-current" />
                </button>
            )}
            {onRemove && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 smooth-transition flex-shrink-0 rounded-full p-2"
                  title="Remove from Queue"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
      )}
    </div>
  );
}
