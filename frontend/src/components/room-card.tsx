"use client";

import Link from "next/link";
import { Users, Flame } from "lucide-react";

interface RoomCardProps {
  id: string;
  title: string;
  listeners: number;
  mood: string;
  host: string;
  thumbnail?: string;
  isLive?: boolean;
}

export function RoomCard({
  id,
  title,
  listeners,
  mood,
  host,
  thumbnail,
  isLive = true,
}: RoomCardProps) {
  return (
    <Link href={`/room/${id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-xl border border-border/50 shadow-sm">
        {/* Thumbnail */}
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-md">
          <img
            src={thumbnail || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1000&auto=format&fit=crop"} // Better placeholder
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 dark:bg-black/60 px-2.5 py-1 backdrop-blur-md border border-white/10">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live</span>
            </div>
          )}
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
             <div className="rounded-full bg-primary p-3 shadow-lg hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                   <path d="M8 5v14l11-7z" />
                </svg>
             </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-1 text-base font-bold text-foreground group-hover:underline tracking-tight">
            {title}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground font-medium">
            By {host}
          </p>
          
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-bold uppercase tracking-tighter tabular-nums">
             <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {listeners.toLocaleString()} listening
             </span>
             <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] uppercase tracking-widest font-black">
                {mood}
             </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
