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
}: QueueSongItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`glass-card group hover:border-electric-magenta/50 smooth-transition flex items-center justify-between p-3 ${
        isNow ? "border-electric-magenta/50 bg-[rgba(214,93,242,0.05)]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Drag handle (DJ only) */}
        {isDJ && (
          <Grip className="text-muted-foreground group-hover:text-electric-magenta h-4 w-4 flex-shrink-0 cursor-grab" />
        )}

        {/* Thumbnail */}
        <div className="from-deep-purple to-ocean-blue relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br">
          {thumbnail ? (
            <img
              src={thumbnail || "/placeholder.svg"}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <Music className="text-muted-foreground h-full w-full p-2" />
          )}
          {isNow && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Play className="text-electric-magenta h-4 w-4 fill-current" />
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="min-w-0 flex-1">
          <p
            className={`font-600 truncate text-sm ${isNow ? "text-electric-magenta" : "text-soft-white"}`}
          >
            {title}
          </p>
          <div className="text-muted-foreground flex items-center gap-2 truncate text-xs">
            <span className="truncate">{artist}</span>
            <span>•</span>
            <span className="flex-shrink-0">{duration}</span>
          </div>
        </div>

        {/* Requested by */}
        <div className="flex-shrink-0 text-right">
          <p className="text-muted-foreground text-xs">{requestedBy}</p>
          {requestedByRole && (
            <p className="text-ocean-blue font-500 text-xs">
              {requestedByRole}
            </p>
          )}
        </div>
      </div>

      {/* Delete button (DJ only) */}
      {isDJ && isHovered && (
        <button className="text-destructive hover:bg-destructive/10 smooth-transition ml-2 flex-shrink-0 rounded p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
