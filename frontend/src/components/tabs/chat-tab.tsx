"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Sparkles } from "lucide-react";
import { ChatMessage } from "../chat-message";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface Message {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  role?: "admin" | "dj" | "moderator";
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
  isOwn?: boolean;
}

import type { ChatMessage as ChatMessageType } from "@frontend/types";

interface ChatTabProps {
  messages?: ChatMessageType[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
  isConnected?: boolean;
}

export function ChatTab({
  messages: socketMessages = [],
  onSendMessage,
  currentUserId,
  isConnected = false,
}: ChatTabProps) {
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (socketMessages.length > 0) {
      const converted = socketMessages.map((msg) => ({
        id: msg.id,
        user: msg.username,
        avatar: msg.avatar || "🎵",
        message: msg.message,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: msg.userId === currentUserId,
      }));
      setLocalMessages(converted);
    }
  }, [socketMessages, currentUserId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex h-full min-h-[500px] flex-col p-6 relative bg-surface-low/30">
      {/* Connection status overlay */}
      {!isConnected && (
        <div className="absolute top-0 left-0 right-0 z-20 py-1 bg-yellow-500/10 border-b border-yellow-500/20 text-center text-[9px] font-black uppercase tracking-widest text-yellow-500">
          Syncing with SONIQ Pulse...
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide">
        {localMessages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center opacity-40">
            <Sparkles className="h-12 w-12 text-primary/40 mb-6 animate-pulse" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white">The Pulse is quiet</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Ignite the conversation below</p>
          </div>
        ) : (
          localMessages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popover */}
      <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute bottom-24 right-6 z-50 overflow-hidden shadow-2xl rounded-[2rem] border border-white/10"
            >
               <EmojiPicker 
                  onEmojiClick={onEmojiClick}
                  theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                  width={320}
                  height={450}
                  lazyLoadEmojis={true}
               />
            </motion.div>
          )}
      </AnimatePresence>

      {/* Premium Message Input */}
      <div className="mt-6 flex items-center gap-4 group">
        <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Inject vibe into the chat..."
              className="w-full bg-black/40 text-white placeholder:text-muted-foreground/40 rounded-2xl border border-white/5 px-6 py-4 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all font-medium text-sm shadow-xl"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
                showEmojiPicker ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              <Smile className="h-5 w-5" />
            </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected}
          className="bg-primary text-white h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(var(--primary-rgb),0.3)] disabled:opacity-30 disabled:grayscale transition-all"
        >
          <Send className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
