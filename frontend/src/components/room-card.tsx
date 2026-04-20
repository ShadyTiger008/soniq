"use client";

import Link from "next/link";
import { Users, Music2 } from "lucide-react";
import { motion } from "framer-motion";

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
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group relative overflow-hidden rounded-2xl bg-surface-high p-4 transition-colors hover:bg-surface-highest shadow-xl"
      >
        {/* Thumbnail Layer */}
        <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-surface-low">
          <img
            src={thumbnail || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1000&auto=format&fit=crop"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />
          
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-xl border border-white/5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live</span>
            </div>
          )}

          {/* Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100 backdrop-blur-[4px]">
             <div className="rounded-full bg-primary p-4 shadow-2xl shadow-primary/40 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-primary-foreground" xmlns="http://www.w3.org/2000/svg">
                   <path d="M8 5v14l11-7z" />
                </svg>
             </div>
          </div>
        </div>

        {/* Content Layer */}
        <div className="flex flex-col gap-2">
          <h3 className="line-clamp-1 text-lg font-black text-white decoration-primary/0 underline-offset-4 transition-all group-hover:decoration-primary/100">
            {title}
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 group-hover:bg-primary/20 transition-colors">
               <Music2 className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="line-clamp-1 text-xs text-muted-foreground font-semibold">
              Curated by {host}
            </p>
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>{listeners.toLocaleString()} Vibes</span>
             </div>
             <span className="rounded-md bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {mood}
             </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
