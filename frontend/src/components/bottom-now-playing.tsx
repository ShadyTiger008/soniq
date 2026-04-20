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
      className="bg-surface-highest/60 backdrop-blur-[24px] fixed right-4 bottom-4 left-4 z-50 rounded-2xl border border-white/5 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:right-8 md:bottom-8 md:left-auto md:w-[450px]"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Now playing info */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-surface-low flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
             <Music className="text-primary h-7 w-7" />
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
            <p className="font-black text-white truncate text-base tracking-tight mb-0.5">
               Chill Beats for Productive Mornings
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
                <Radio className="h-2.5 w-2.5 text-primary" />
              </div>
              <p className="text-muted-foreground truncate text-[10px] font-black uppercase tracking-[0.2em]">
                 Lofi Music Studio
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-110 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="ml-1 h-6 w-6 fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar Layer */}
      <div className="mt-4 px-1">
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
           <motion.div 
             initial={{ width: "30%" }}
             animate={{ width: isPlaying ? "80%" : "30%" }}
             transition={{ duration: 10, ease: "linear", repeat: Infinity }}
             className="bg-primary h-full rounded-full shadow-[0_0_12px_rgba(114,254,143,0.6)]" 
           />
        </div>
      </div>
    </motion.div>
  );
}
