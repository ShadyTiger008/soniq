"use client";

import { Play, Pause, Music, Radio } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNowPlaying() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="bg-surface-highest/40 backdrop-blur-3xl fixed right-4 bottom-4 left-4 z-50 rounded-2xl border border-white/5 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.8)] md:right-8 md:bottom-8 md:left-auto md:w-[400px]"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Now playing info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-surface-low flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
             <Music className="text-primary h-5 w-5" />
             <AnimatePresence>
               {isPlaying && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-primary/10 animate-pulse" 
                 />
               )}
             </AnimatePresence>
          </div>
          <div className="min-w-0">
            <p className="font-black text-white truncate text-sm tracking-tight mb-0.5 uppercase italic">
               Chill Beats for Productive Mornings
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/20">
                <Radio className="h-2 w-2 text-primary" />
              </div>
              <p className="text-white/20 truncate text-[8px] font-black uppercase tracking-[0.2em]">
                 Lofi Music Studio
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar Layer */}
      <div className="mt-3 px-0.5">
        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
           <motion.div 
             initial={{ width: "30%" }}
             animate={{ width: isPlaying ? "80%" : "30%" }}
             transition={{ duration: 10, ease: "linear", repeat: Infinity }}
             className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(114,254,143,0.4)]" 
           />
        </div>
      </div>
    </motion.div>
  );
}
