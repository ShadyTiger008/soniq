"use client";

import { useState } from "react";
import { Smile, Reply } from "lucide-react";

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
    <div
      className={`glass-card hover:border-electric-magenta/50 smooth-transition group rounded-xl p-4 border-2 ${
        isOwn
          ? "border-electric-magenta/30 bg-[rgba(214,93,242,0.05)]"
          : "border-transparent"
      }`}
    >
      {/* Message header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="from-deep-purple to-electric-magenta flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r text-sm font-bold shadow-lg shadow-electric-magenta/20">
            {avatar}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-600 text-soft-white text-sm">{user}</p>
            {role === "admin" && (
              <span className="text-neon-pink border-neon-pink/30 rounded-full border bg-[rgba(255,0,110,0.1)] px-2 py-0.5 text-xs font-semibold">
                Admin
              </span>
            )}
            {role === "dj" && (
              <span className="text-ocean-blue border-ocean-blue/30 rounded-full border bg-[rgba(59,130,246,0.1)] px-2 py-0.5 text-xs font-semibold">
                DJ
              </span>
            )}
            {role === "moderator" && (
              <span className="text-neon-cyan border-neon-cyan/30 rounded-full border bg-[rgba(0,245,255,0.1)] px-2 py-0.5 text-xs font-semibold">
                Mod
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs shrink-0 ml-2">{timestamp}</p>
      </div>

      {/* Message body */}
      <p className="text-soft-white mb-3 text-sm leading-relaxed">{message}</p>

      {/* Reactions */}
      {reactions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {reactions.map((reaction, i) => (
            <button
              key={i}
              onClick={() => {
                console.log(`Toggle reaction ${reaction.emoji} on message ${id}`);
              }}
              className={`smooth-transition rounded-full px-3 py-1.5 text-xs font-500 border-2 ${
                reaction.userReacted
                  ? "border-electric-magenta bg-[rgba(214,93,242,0.2)] text-electric-magenta"
                  : "hover:border-electric-magenta border border-deep-purple/30 bg-[rgba(108,43,217,0.1)] text-muted-foreground hover:text-soft-white"
              }`}
            >
              {reaction.emoji} {reaction.count}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="smooth-transition flex items-center gap-2 opacity-0 group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-muted-foreground hover:text-soft-white smooth-transition rounded-lg p-1.5 hover:bg-[rgba(108,43,217,0.2)]"
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </button>

          {showReactions && (
            <div className="glass-card absolute bottom-full left-0 mb-2 flex w-56 flex-wrap gap-2 rounded-xl p-3 border-2 border-deep-purple/20 shadow-2xl">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    console.log(`Added reaction ${emoji} to message ${id}`);
                    setShowReactions(false);
                  }}
                  className="smooth-transition text-2xl hover:scale-125 p-1 rounded-lg hover:bg-white/5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => console.log(`Reply to message ${id}`)}
          className="text-muted-foreground hover:text-soft-white smooth-transition rounded-lg p-1.5 hover:bg-[rgba(108,43,217,0.2)]"
          title="Reply"
        >
          <Reply className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
