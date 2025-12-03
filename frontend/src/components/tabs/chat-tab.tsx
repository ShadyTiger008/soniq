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

interface ChatTabProps {
  messages?: Array<{
    id: string;
    userId: string;
    username: string;
    avatar?: string;
    message: string;
    timestamp: string;
  }>;
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
    }
  };

  return (
    <div className="flex h-full min-h-[400px] flex-col p-4">
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
              <p className="mb-2 text-lg">No messages yet</p>
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
          disabled={!message.trim() || !isConnected}
          className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink smooth-transition shrink-0 rounded-xl bg-gradient-to-r p-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-electric-magenta/20"
          title="Send message"
        >
          <Send className="text-soft-white h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
