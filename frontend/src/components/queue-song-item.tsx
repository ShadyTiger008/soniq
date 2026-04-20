"use client";

import { Grip, Trash2, Music, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex items-center justify-between p-3 rounded-2xl border border-white/5 transition-all duration-300 relative overflow-hidden",
        isNow 
          ? "bg-primary/10 border-primary/30 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.2)]" 
          : "bg-surface-high/30 hover:bg-surface-high/60 hover:border-white/10"
      )}
    >
      {isNow && (
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      )}

      <div className="flex min-w-0 flex-1 items-center gap-4 relative z-10">
        {/* Grip for Host/DJ */}
        {isDJ && (
          <Grip className="text-white/20 group-hover:text-primary h-4 w-4 shrink-0 transition-colors cursor-grab active:cursor-grabbing" />
        )}

        {/* High-Fidelity Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-highest border border-white/5 shadow-inner">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
               <Music className="h-5 w-5 text-primary/40" />
            </div>
          )}
          
          <AnimatePresence>
            {isNow && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]"
              >
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Play className="text-white h-3 w-3 fill-current ml-0.5" />
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editorial Info */}
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm font-black truncate tracking-tight transition-colors",
            isNow ? "text-primary" : "text-white"
          )}>
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{artist}</span>
             <span className="text-[10px] text-white/10">•</span>
             <span className="text-[10px] font-black text-white/30 tabular-nums">{duration}</span>
          </div>
        </div>

        {/* Requester Tag */}
        <div className="shrink-0 text-right pr-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-end gap-1.5">
                {isNow && <Sparkles className="h-2.5 w-2.5 text-primary" />}
                {requestedBy}
            </span>
            {requestedByRole && (
                <p className="text-primary text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-60">
                    {requestedByRole}
                </p>
            )}
        </div>
      </div>

      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {(isDJ || isOwn) && isHovered && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-1.5 ml-3 relative z-20"
          >
              {!isNow && onPlay && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPlay(); }}
                    className="h-9 w-9 flex items-center justify-center bg-primary/20 border border-primary/20 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                  >
                      <Play className="h-4 w-4 fill-current" />
                  </button>
              )}
              {onRemove && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="h-9 w-9 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
