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
      <div className="glass-card hover:border-electric-magenta group smooth-transition hover:shadow-electric-magenta/20 cursor-pointer overflow-hidden rounded-xl hover:shadow-lg">
        {/* Thumbnail */}
        <div className="from-deep-purple to-ocean-blue relative aspect-video overflow-hidden bg-gradient-to-br">
          <img
            src={thumbnail || "/placeholder.svg?query=music room thumbnail"}
            alt={title}
            className="smooth-transition h-full w-full object-cover group-hover:scale-105"
          />
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-1 backdrop-blur">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="font-600 text-xs text-white">LIVE</span>
            </div>
          )}
          <div className="from-midnight-black/80 smooth-transition absolute inset-0 flex items-end bg-gradient-to-t to-transparent p-3 opacity-0 group-hover:opacity-100">
            <div className="from-deep-purple to-electric-magenta font-600 text-soft-white hover:from-electric-magenta hover:to-neon-pink w-full rounded-lg bg-gradient-to-r py-2 text-center text-sm">
              Join Room
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-heading font-600 text-soft-white mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground mb-3 text-xs">By {host}</p>

          {/* Stats and mood */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span>{listeners.toLocaleString()}</span>
              </div>
              <Flame className="text-neon-pink h-3 w-3" />
            </div>
            <span className="text-electric-magenta border-electric-magenta/20 rounded-full border bg-[rgba(214,93,242,0.1)] px-2 py-1 text-xs">
              {mood}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
