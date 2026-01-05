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
          <div className="bg-primary smooth-transition group rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md shadow-primary/10">
            <p className="text-primary-foreground text-sm font-medium leading-relaxed break-words">
              {message}
            </p>
          </div>

          {/* Timestamp and actions */}
          <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tabular-nums tracking-wider">{timestamp}</p>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="text-muted-foreground hover:text-foreground smooth-transition rounded-lg p-1 hover:bg-muted"
                  title="Add reaction"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                {showReactions && (
                  <div className="glass-card absolute bottom-full right-0 mb-2 flex w-56 flex-wrap gap-2 rounded-xl p-3 border border-border bg-card/95 shadow-2xl z-50">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          console.log(
                            `Added reaction ${emoji} to message ${id}`
                          );
                          setShowReactions(false);
                        }}
                        className="smooth-transition text-2xl hover:scale-125 p-1 rounded-lg hover:bg-muted"
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
                  className={`smooth-transition rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all ${
                    reaction.userReacted
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/50 border-border bg-muted/50 text-muted-foreground hover:text-foreground"
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-3xl bg-muted text-sm font-bold shadow-sm border border-border text-foreground overflow-hidden">
           {avatar}
        </div>

        {/* Message content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* User info */}
          <div className="mb-1 flex items-center gap-2">
            <p className="font-bold text-foreground text-sm tracking-tight">{user}</p>
            {role === "admin" && (
              <span className="text-purple-600 dark:text-purple-400 border-purple-500/30 rounded-full border bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Admin
              </span>
            )}
            {role === "dj" && (
              <span className="text-blue-600 dark:text-blue-400 border-blue-500/30 rounded-full border bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                DJ
              </span>
            )}
            {role === "moderator" && (
              <span className="text-cyan-600 dark:text-cyan-400 border-cyan-500/30 rounded-full border bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Mod
              </span>
            )}
          </div>

          {/* Message bubble */}
          <div className="bg-muted smooth-transition rounded-2xl rounded-tl-sm px-4 py-2.5 border border-border shadow-sm">
            <p className="text-foreground text-sm leading-relaxed break-words font-medium">
              {message}
            </p>
          </div>

          {/* Timestamp and actions */}
          <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tabular-nums tracking-wider">{timestamp}</p>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="text-muted-foreground hover:text-foreground smooth-transition rounded-lg p-1 hover:bg-muted"
                  title="Add reaction"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                {showReactions && (
                  <div className="glass-card absolute bottom-full left-0 mb-2 flex w-56 flex-wrap gap-2 rounded-xl p-3 border border-border bg-card/95 shadow-2xl z-50">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          console.log(
                            `Added reaction ${emoji} to message ${id}`
                          );
                          setShowReactions(false);
                        }}
                        className="smooth-transition text-2xl hover:scale-125 p-1 rounded-lg hover:bg-muted"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => console.log(`Reply to message ${id}`)}
                className="text-muted-foreground hover:text-foreground smooth-transition rounded-lg p-1 hover:bg-muted"
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
                  className={`smooth-transition rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all ${
                    reaction.userReacted
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/50 border-border bg-muted/50 text-muted-foreground hover:text-foreground"
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
