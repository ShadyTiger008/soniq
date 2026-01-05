"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X } from "lucide-react";
import { ChatMessage } from "../chat-message";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";

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

  // Convert socket messages to local format
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
    <div className="flex h-full min-h-[400px] flex-col p-4 relative">
      {/* Connection status */}
      {!isConnected && (
        <div className="mb-2 text-center text-xs text-yellow-500">
          Connecting to room...
        </div>
      )}

      {/* Messages area with proper scrolling */}
      <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {localMessages.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-center">
            <div>
              <p className="mb-2 text-lg font-bold">No messages yet</p>
              <p className="text-sm">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          localMessages.map((msg) => (
            <div key={msg.id} className="w-full">
              <ChatMessage {...msg} />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
           <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-border">
               <button 
                  onClick={() => setShowEmojiPicker(false)} 
                  className="absolute top-2 right-2 z-50 bg-popover/80 backdrop-blur-sm rounded-full p-1 text-foreground hover:bg-accent shadow-sm border border-border"
               >
                   <X className="h-4 w-4" />
               </button>
               <EmojiPicker 
                  onEmojiClick={onEmojiClick}
                  theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                  width={300}
                  height={400}
                  lazyLoadEmojis={true}
               />
           </div>
        </div>
      )}

      {/* Message input with Premium Design */}
      <div className="flex gap-2 pt-2 items-end">
        {/* Attachment - Placeholder for now */}
        {/* <button
          onClick={() => alert("Attachment feature coming soon!")}
          className="glass-card hover:border-ocean-blue smooth-transition shrink-0 rounded-xl p-2.5 border-2 border-transparent mb-[2px]"
          title="Attach file"
        >
          <Paperclip className="text-muted-foreground hover:text-soft-white h-5 w-5" />
        </button> */}

        <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Say something..."
              className="w-full text-foreground placeholder:text-muted-foreground focus:border-primary smooth-transition rounded-xl border border-input bg-secondary pl-4 pr-10 py-3 focus:ring-2 focus:outline-none focus:ring-primary/20"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-full transition-colors"
              title="Add emoji"
            >
              <Smile className={`h-5 w-5 ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} />
            </button>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected}
          className="bg-primary hover:bg-primary/90 smooth-transition shrink-0 rounded-xl p-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 mb-[2px]"
          title="Send message"
        >
          <Send className="text-primary-foreground h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
