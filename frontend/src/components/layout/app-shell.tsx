"use client";

import { Sidebar } from "./sidebar";
import { PlayerBar } from "./player-bar";
import { cn } from "@frontend/lib/utils";
import { useState, useEffect } from "react";

interface AppShellProps {
  children: React.ReactNode;
  playerProps?: React.ComponentProps<typeof PlayerBar>;
  className?: string; // For adding specific classes to the main content
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
          <div className="hidden md:block w-[280px] h-full shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <main className={cn(
            "flex-1 h-full overflow-hidden bg-background relative border border-border/40 shadow-sm transition-all duration-300",
            !isFullscreen && "md:rounded-lg md:my-2 md:mr-2",
            isFullscreen && "border-none",
            className
        )}>
           {/* Header gradient Overlay */}
          <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 dark:from-primary/20 via-background to-background pointer-events-none z-0" />
          
          <div className="relative z-10 w-full h-full overflow-y-auto scrollbar-hide">
             {children}
          </div>
        </main>
      </div>

      {/* Persistent Player Bar */}
      <div className={cn(
        "h-[90px] w-full shrink-0 z-50 border-t border-border/60 shadow-lg bg-card/95 backdrop-blur-md",
        isFullscreen && "border-t-primary/20"
      )}>
        <PlayerBar {...playerProps} />
      </div>
    </div>
  );
}
