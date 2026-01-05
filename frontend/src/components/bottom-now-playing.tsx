"use client";

import { Play, Pause, Music } from "lucide-react";
import { useState } from "react";

export function BottomNowPlaying() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="bg-card/80 backdrop-blur-xl fixed right-0 bottom-0 left-0 z-10 border-t border-border p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Now playing info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border sm:flex">
             <Music className="text-primary h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate text-sm tracking-tight">
               Chill Beats for Productive Mornings
            </p>
            <p className="text-muted-foreground truncate text-[10px] font-black uppercase tracking-widest">
               Lofi Music Studio
            </p>
          </div>
        </div>

        {/* Progress bar and controls */}
        <div className="flex items-center gap-6">
          <div className="hidden w-32 sm:block">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
               <div className="bg-primary h-full w-1/3 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-primary text-primary-foreground hover:scale-105 active:scale-95 smooth-transition rounded-full p-3 shadow-lg shadow-primary/20"
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
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-0.5">Lofi Study Lounge</p>
          <p className="font-bold text-foreground text-sm tracking-tight">1,234 vibing</p>
        </div>
      </div>
    </div>
  );
}
