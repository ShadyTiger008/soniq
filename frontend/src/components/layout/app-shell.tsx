"use client";

import { Sidebar } from "./sidebar";
import { PlayerBar } from "./player-bar";
import { cn } from "@frontend/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppShellProps {
  children: React.ReactNode;
  playerProps?: React.ComponentProps<typeof PlayerBar>;
  className?: string;
}

export function AppShell({ children, playerProps, className }: AppShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden in Fullscreen */}
        {!isFullscreen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="hidden md:block w-[300px] h-full shrink-0"
          >
            <Sidebar />
          </motion.div>
        )}

        {/* Main Content Area */}
        <main className={cn(
            "flex-1 h-full overflow-hidden bg-background relative transition-all duration-500",
            !isFullscreen && "md:rounded-[2rem] md:my-4 md:mr-4 bg-surface-low shadow-inner",
            isFullscreen && "rounded-none m-0",
            className
        )}>
           {/* Cinematic Radial Glow */}
           <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none z-0 opacity-50" />
           
           <div className="relative z-10 w-full h-full overflow-y-auto scrollbar-hide">
              {children}
           </div>
        </main>
      </div>

      {/* Persistent Player Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={cn(
          "h-[100px] w-full shrink-0 z-50 bg-background/80 backdrop-blur-3xl border-t border-white/5",
          isFullscreen && "absolute bottom-0 left-0 right-0 border-t-primary/20"
        )}
      >
        <PlayerBar {...playerProps} />
      </motion.div>
    </div>
  );
}
