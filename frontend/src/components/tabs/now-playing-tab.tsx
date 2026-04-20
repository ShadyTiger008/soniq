"use client";

import type { Song } from "@frontend/types";
import { Music, Sparkles, Radio } from "lucide-react";
import { motion } from "framer-motion";

interface NowPlayingTabProps {
  currentSong?: Song | null;
}

export function NowPlayingTab({ currentSong }: NowPlayingTabProps) {
  return (
    <div className="h-full bg-surface-low/30 p-8 overflow-y-auto scrollbar-hide">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        {/* Cinematic Cover Art Container */}
        <div className="relative group w-full max-w-[280px] aspect-square mb-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.02, 1],
              rotate: [0, 1, 0, -1, 0]
            }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="w-full h-full rounded-[2.5rem] bg-surface-highest overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-white/10 relative z-10"
          >
            {currentSong?.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/40 to-primary/20">
                <Music className="h-20 w-20 text-white opacity-40 drop-shadow-2xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
          
          {/* Ambient Glow */}
          <div className="absolute inset-x-4 -bottom-4 h-full bg-primary/20 blur-[60px] rounded-full z-0 opacity-40" />
        </div>

        {/* Editorial Track Info */}
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Master Stream</span>
          </div>

          <h3 className="text-3xl font-black text-white tracking-tighter leading-tight font-epilogue">
            {currentSong?.title || "Silence in the Air"}
          </h3>
          
          <p className="text-lg text-muted-foreground font-bold tracking-tight opacity-80 uppercase tracking-[0.15em] text-[12px]">
            {currentSong?.artist || "The Pulse Awaits Your Choice"}
          </p>

          <div className="pt-8 grid grid-cols-2 gap-4">
             <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Duration</p>
                <p className="text-white font-black tabular-nums">{currentSong?.duration || "00:00"}</p>
             </div>
             <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Vibe State</p>
                <div className="flex items-center gap-1.5 justify-center">
                   <Sparkles className="h-3 w-3 text-primary" />
                   <p className="text-white font-black uppercase text-[10px]">Energetic</p>
                </div>
             </div>
          </div>
          
          <div className="mt-10 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center gap-3">
             <Radio className="h-4 w-4 text-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tuning frequencies synced</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
