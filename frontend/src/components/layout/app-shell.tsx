"use client";

import { Sidebar } from "./sidebar";
import { PlayerBar } from "./player-bar";
import { cn } from "@frontend/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  playerProps?: React.ComponentProps<typeof PlayerBar>;
  className?: string; // For adding specific classes to the main content
}

export function AppShell({ children, playerProps, className }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed width */}
        <div className="hidden md:block w-[280px] h-full shrink-0 border-r border-border/40">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className={cn(
            "flex-1 h-full overflow-hidden bg-background md:rounded-lg md:my-2 md:mr-2 relative border border-border/40 shadow-sm",
            className
        )}>
           {/* Header gradient Overlay - Sophisticated and theme-aware */}
          <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 dark:from-primary/20 via-background to-background pointer-events-none z-0" />
          
          <div className="relative z-10 w-full h-full overflow-y-auto scrollbar-hide">
             {children}
          </div>
        </main>
      </div>

      {/* Persistent Player Bar */}
      <div className="h-[90px] w-full shrink-0 z-50 border-t border-border/60 shadow-lg">
        <PlayerBar {...playerProps} />
      </div>
    </div>
  );
}
