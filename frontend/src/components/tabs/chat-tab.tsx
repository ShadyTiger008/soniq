"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Sparkles } from "lucide-react";
import { ChatMessage } from "../chat-message";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@frontend/lib/auth-context";

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

import type { ChatMessage as ChatMessageType, RoomMember } from "@frontend/types";

interface ChatTabProps {
  messages?: ChatMessageType[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
  isConnected?: boolean;
  roomMembers?: RoomMember[];
}

export function ChatTab({
  messages: socketMessages = [],
  onSendMessage,
  currentUserId,
  isConnected = false,
  roomMembers = [],
}: ChatTabProps) {
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const { resolvedTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const isGuest = user?.isGuest;

  const SONIQ_ID = "soniq-ai";
  const SONIQ_USER = {
    id: SONIQ_ID,
    _id: SONIQ_ID,
    username: "soniq",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Soniq&backgroundColor=b6e3f4,c0aede,d1d4f9",
    role: "ai-agent"
  };

  const filteredMembers = mentionSearch !== null
    ? [
        SONIQ_USER,
        ...roomMembers.filter(m => 
          m.username.toLowerCase().includes(mentionSearch.toLowerCase()) &&
          (m.id || m._id) !== currentUserId &&
          (m.id || m._id) !== SONIQ_ID
        )
      ].filter(m => m.username.toLowerCase().includes(mentionSearch.toLowerCase()))
    : [];

  useEffect(() => {
    if (socketMessages.length > 0) {
      const converted = socketMessages.map((msg) => ({
        id: msg.id,
        userId: msg.userId,
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
      setMentionSearch(null);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setMessage(val);

    // Mention logic
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show if there's no space between @ and cursor
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt);
        setMentionIndex(0);
        return;
      }
    }
    setMentionSearch(null);
  };

  const selectMention = (username: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    const newMessage = 
      message.slice(0, lastAtIndex) + 
      `@${username} ` + 
      textAfterCursor;
      
    setMessage(newMessage);
    setMentionSearch(null);
    
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = lastAtIndex + username.length + 2;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionSearch !== null && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredMembers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectMention(filteredMembers[mentionIndex]?.username || "");
      } else if (e.key === "Escape") {
        setMentionSearch(null);
      }
    } else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full min-h-[500px] flex-col p-6 relative bg-surface-low/30">
      {/* Connection status overlay */}
      {!isConnected && (
        <div className="absolute top-0 left-0 right-0 z-20 py-1 bg-yellow-500/10 border-b border-yellow-500/20 text-center text-[9px] font-black uppercase tracking-widest text-yellow-500">
          Syncing with Vibecue Pulse...
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

      {/* Mention List Popover */}
      <AnimatePresence>
        {mentionSearch !== null && filteredMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-24 left-6 z-[60] w-64 bg-surface-highest/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-white/5 bg-white/5">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary px-2">Mention Someone</span>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
                {filteredMembers.map((member, index) => {
                  const isSoniq = member.id === SONIQ_ID;
                  return (
                    <button
                      key={member.id || member._id}
                      onClick={() => selectMention(member.username)}
                      onMouseEnter={() => setMentionIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all relative group/item",
                        index === mentionIndex 
                          ? (isSoniq ? "bg-primary/30 text-white" : "bg-primary/20 text-white") 
                          : "text-white/60 hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden border transition-all",
                        isSoniq ? "border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "bg-surface-low border-white/10"
                      )}>
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          member.username[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={cn("text-sm font-bold truncate", isSoniq && "text-primary")}>
                            @{member.username}
                          </p>
                          {isSoniq && (
                            <span className="text-[7px] font-black uppercase tracking-tighter bg-primary text-white px-1 py-0.5 rounded-sm">AI</span>
                          )}
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">
                          {isSoniq ? "Virtual Agent" : (member.role || "Listener")}
                        </p>
                      </div>

                      {/* Soniq Hover Details */}
                      {isSoniq && index === mentionIndex && (
                        <div className="absolute left-full ml-2 top-0 w-48 p-3 bg-surface-highest/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl z-[70] pointer-events-none">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Capabilities</p>
                          <ul className="space-y-1.5">
                            <li className="flex items-center gap-2 text-[9px] text-white/80">
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              Mood-based Curation
                            </li>
                            <li className="flex items-center gap-2 text-[9px] text-white/80">
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              YouTube Music Search
                            </li>
                            <li className="flex items-center gap-2 text-[9px] text-white/80">
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              Discord-style commands
                            </li>
                          </ul>
                          <div className="mt-2 pt-2 border-t border-white/5">
                            <p className="text-[8px] italic text-white/40">Try: "@soniq play some jazz"</p>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isGuest || !isConnected}
              placeholder={isGuest ? "Sign in to join the conversation..." : "Inject vibe into the chat..."}
              className="w-full bg-black/40 text-white placeholder:text-muted-foreground/40 rounded-2xl border border-white/5 px-6 py-4 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all font-medium text-sm shadow-xl disabled:opacity-50"
            />
            <button
              onClick={() => {
                if (isGuest) return;
                setShowEmojiPicker(!showEmojiPicker);
              }}
              disabled={isGuest}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
                showEmojiPicker ? "bg-primary text-white" : "text-muted-foreground hover:text-white",
                isGuest && "opacity-30 cursor-not-allowed"
              )}
            >
              <Smile className="h-5 w-5" />
            </button>
        </div>

        <motion.button
          whileHover={isGuest ? {} : { scale: 1.05 }}
          whileTap={isGuest ? {} : { scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={isGuest || !message.trim() || !isConnected}
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
