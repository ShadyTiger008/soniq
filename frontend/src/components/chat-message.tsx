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

  if (isOwn) {
    // Current user's message - aligned to the right
    return (
      <div className="flex justify-end group">
        <div className="flex flex-col items-end max-w-[75%]">
          {/* Message bubble */}
          <div className="from-deep-purple to-electric-magenta smooth-transition group rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-lg shadow-electric-magenta/20 bg-gradient-to-br">
            <p className="text-soft-white text-sm leading-relaxed break-words">
              {message}
            </p>
          </div>

          {/* Timestamp and actions */}
          <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
            <p className="text-muted-foreground text-xs">{timestamp}</p>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="text-muted-foreground hover:text-soft-white smooth-transition rounded-lg p-1 hover:bg-white/10"
                  title="Add reaction"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                {showReactions && (
                  <div className="glass-card absolute bottom-full right-0 mb-2 flex w-56 flex-wrap gap-2 rounded-xl p-3 border-2 border-deep-purple/20 shadow-2xl z-10">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          console.log(
                            `Added reaction ${emoji} to message ${id}`
                          );
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
            </div>
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 justify-end">
              {reactions.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => {
                    console.log(
                      `Toggle reaction ${reaction.emoji} on message ${id}`
                    );
                  }}
                  className={`smooth-transition rounded-full px-2.5 py-1 text-xs font-500 border ${
                    reaction.userReacted
                      ? "border-electric-magenta bg-[rgba(214,93,242,0.2)] text-electric-magenta"
                      : "hover:border-electric-magenta border-deep-purple/30 bg-[rgba(108,43,217,0.1)] text-muted-foreground hover:text-soft-white"
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Other users' messages - aligned to the left
  return (
    <div className="flex justify-start group">
      <div className="flex gap-3 max-w-[75%]">
        {/* Avatar */}
        <div className="from-deep-purple to-electric-magenta flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r text-sm font-bold shadow-lg shadow-electric-magenta/20">
          {avatar}
        </div>

        {/* Message content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* User info */}
          <div className="mb-1 flex items-center gap-2">
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

          {/* Message bubble */}
          <div className="glass-card smooth-transition rounded-2xl rounded-tl-sm px-4 py-2.5 border-2 border-deep-purple/20">
            <p className="text-soft-white text-sm leading-relaxed break-words">
              {message}
            </p>
          </div>

          {/* Timestamp and actions */}
          <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
            <p className="text-muted-foreground text-xs">{timestamp}</p>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="text-muted-foreground hover:text-soft-white smooth-transition rounded-lg p-1 hover:bg-white/10"
                  title="Add reaction"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                {showReactions && (
                  <div className="glass-card absolute bottom-full left-0 mb-2 flex w-56 flex-wrap gap-2 rounded-xl p-3 border-2 border-deep-purple/20 shadow-2xl z-10">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          console.log(
                            `Added reaction ${emoji} to message ${id}`
                          );
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
                className="text-muted-foreground hover:text-soft-white smooth-transition rounded-lg p-1 hover:bg-white/10"
                title="Reply"
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {reactions.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => {
                    console.log(
                      `Toggle reaction ${reaction.emoji} on message ${id}`
                    );
                  }}
                  className={`smooth-transition rounded-full px-2.5 py-1 text-xs font-500 border ${
                    reaction.userReacted
                      ? "border-electric-magenta bg-[rgba(214,93,242,0.2)] text-electric-magenta"
                      : "hover:border-electric-magenta border-deep-purple/30 bg-[rgba(108,43,217,0.1)] text-muted-foreground hover:text-soft-white"
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
