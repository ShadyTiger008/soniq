"use client";

import { useState } from "react";
import { Smile, Reply, ShieldCheck, Crown, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessageProps {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  role?: "admin" | "dj" | "moderator";
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
  isOwn?: boolean;
}

const REACTION_EMOJIS = ["❤️", "🔥", "😂", "🎉", "👍", "🙌", "✨", "🎵"];

export function ChatMessage({
  id,
  user,
  avatar,
  message,
  timestamp,
  role,
  reactions = [],
  isOwn = false,
}: ChatMessageProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex group mb-4", isOwn ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-3 max-w-[85%]", isOwn ? "flex-row-reverse" : "flex-row")}>
        {/* Cinematic Avatar */}
        <div className={cn(
          "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg overflow-hidden border border-white/10 relative group-hover:scale-110 transition-transform duration-300",
          isOwn ? "bg-primary text-white" : "bg-surface-highest text-white"
        )}>
           {avatar}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Message Panel */}
        <div className={cn("flex flex-col min-w-0", isOwn ? "items-end" : "items-start")}>
          {/* Header Info */}
          {!isOwn && (
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <span className="font-black text-white text-[11px] tracking-tight uppercase opacity-80">{user}</span>
              {role === "admin" && (
                <div className="flex items-center gap-1 text-purple-400 text-[8px] font-black uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                   <ShieldCheck className="h-2 w-2" />
                   Admin
                </div>
              )}
              {role === "dj" && (
                <div className="flex items-center gap-1 text-primary text-[8px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                   <Music className="h-2 w-2" />
                   DJ
                </div>
              )}
            </div>
          )}

          {/* Premium Bubble */}
          <div className={cn(
            "relative group/bubble px-4 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all",
            isOwn 
              ? "bg-primary rounded-[1.25rem] rounded-tr-none text-white" 
              : "bg-surface-highest rounded-[1.25rem] rounded-tl-none border border-white/5 text-white/90"
          )}>
            <p className="text-[13px] leading-relaxed break-words font-medium tracking-tight">
              {message}
            </p>
            
            {/* Quick Actions Hidden by default */}
            <div className={cn(
                "absolute -bottom-6 flex items-center gap-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity",
                isOwn ? "right-1" : "left-1"
            )}>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest tabular-nums">{timestamp}</span>
                <div className="h-px w-4 bg-white/10" />
                <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowReactions(!showReactions)}
                      className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                    >
                        <Smile className="h-3 w-3" />
                    </button>
                    {!isOwn && (
                        <button className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                            <Reply className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Reaction Picker Popover */}
            <AnimatePresence>
                {showReactions && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className={cn(
                            "absolute bottom-full mb-3 z-50 bg-surface-highest/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-1",
                            isOwn ? "right-0" : "left-0"
                        )}
                    >
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setShowReactions(false)}
                            className="hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-white/5"
                          >
                            <span className="text-lg">{emoji}</span>
                          </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Rendered Reactions */}
          {reactions.length > 0 && (
            <div className={cn("mt-2 flex flex-wrap gap-1.5", isOwn ? "justify-end" : "justify-start")}>
              {reactions.map((reaction, i) => (
                <button
                  key={i}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all",
                    reaction.userReacted
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span className="opacity-60">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
