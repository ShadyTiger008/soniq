"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { ChatMessage } from "../chat-message";

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

export function ChatTab() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "DJ Mike",
      avatar: "🎧",
      message: "Welcome to Midnight Vibes! Thanks for joining",
      timestamp: "8:15 PM",
      role: "dj",
      reactions: [
        { emoji: "❤️", count: 12, userReacted: true },
        { emoji: "🔥", count: 8, userReacted: false },
      ],
    },
    {
      id: "2",
      user: "Alex",
      avatar: "👤",
      message: "This track is absolutely amazing!",
      timestamp: "8:16 PM",
      reactions: [{ emoji: "🎉", count: 5, userReacted: false }],
    },
    {
      id: "3",
      user: "You",
      avatar: "🎵",
      message: "Love the vibes in this room",
      timestamp: "8:17 PM",
      isOwn: true,
      reactions: [
        { emoji: "🙌", count: 3, userReacted: true },
        { emoji: "❤️", count: 2, userReacted: false },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          user: "You",
          avatar: "🎵",
          message: message.trim(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: true,
        },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="flex h-full min-h-[400px] flex-col p-4">
      {/* Messages area with proper scrolling */}
      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} {...msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input with Premium Design */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => alert("Attachment feature coming soon!")}
          className="glass-card hover:border-ocean-blue smooth-transition shrink-0 rounded-xl p-2.5 border-2 border-transparent"
          title="Attach file"
        >
          <Paperclip className="text-muted-foreground hover:text-soft-white h-5 w-5" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Say something..."
          className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta smooth-transition flex-1 rounded-xl border-2 border-deep-purple/30 bg-[rgba(26,22,51,0.6)] px-4 py-2.5 focus:ring-2 focus:outline-none"
        />

        <button
          onClick={() => alert("Emoji picker coming soon!")}
          className="glass-card hover:border-electric-magenta smooth-transition shrink-0 rounded-xl p-2.5 border-2 border-transparent"
          title="Add emoji"
        >
          <Smile className="text-electric-magenta h-5 w-5" />
        </button>

        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink smooth-transition shrink-0 rounded-xl bg-gradient-to-r p-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-electric-magenta/20"
          title="Send message"
        >
          <Send className="text-soft-white h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
