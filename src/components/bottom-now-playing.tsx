"use client";

import { Play, Pause } from "lucide-react";
import { useState } from "react";

export function BottomNowPlaying() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="glass-card fixed right-0 bottom-0 left-0 z-10 border-t border-[rgba(108,43,217,0.2)] p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Now playing info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src="/abstract-album-art.png"
            alt="Now Playing"
            className="hidden h-12 w-12 rounded-lg object-cover sm:block"
          />
          <div className="min-w-0">
            <p className="font-600 text-soft-white truncate text-sm">
              Current Track Title
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Artist Name
            </p>
          </div>
        </div>

        {/* Progress bar and controls */}
        <div className="flex items-center gap-3">
          <div className="hidden w-20 sm:block">
            <div className="h-1 rounded-full bg-[rgba(108,43,217,0.2)]">
              <div className="from-deep-purple to-electric-magenta h-full w-1/3 rounded-full bg-gradient-to-r" />
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="from-deep-purple to-electric-magenta text-soft-white hover:from-electric-magenta hover:to-neon-pink smooth-transition rounded-full bg-gradient-to-r p-2"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )}
          </button>
        </div>

        {/* Room info */}
        <div className="hidden text-right md:block">
          <p className="text-muted-foreground text-xs">Midnight Vibes</p>
          <p className="font-500 text-soft-white text-sm">1,234 listening</p>
        </div>
      </div>
    </div>
  );
}
