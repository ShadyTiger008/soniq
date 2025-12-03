"use client";

import { useState } from "react";
import { Music, MessageCircle, List, Users } from "lucide-react";
import { NowPlayingTab } from "./tabs/now-playing-tab";
import { ChatTab } from "./tabs/chat-tab";
import { QueueTab } from "./tabs/queue-tab";
import { MembersTab } from "./tabs/members-tab";

type TabType = "now-playing" | "chat" | "queue" | "members";

interface Song {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: string;
}

interface RoomTabsProps {
  queue?: Song[];
  currentSong?: Song | null;
  chatMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
  isConnected?: boolean;
}

export function RoomTabs({
  queue = [],
  currentSong = null,
  chatMessages = [],
  onSendMessage,
  currentUserId,
  isConnected = false,
}: RoomTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  const tabs = [
    { id: "now-playing", label: "Now Playing", icon: Music, emoji: "♫" },
    { id: "chat", label: "Chat", icon: MessageCircle, emoji: "💬" },
    { id: "queue", label: "Up Next", icon: List, emoji: "📋" },
    { id: "members", label: "Members", icon: Users, emoji: "👥" },
  ] as const;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab navigation with Premium Design */}
      <div className="flex gap-2 overflow-x-auto border-b-2 border-deep-purple/20 p-4 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`smooth-transition flex items-center gap-2 rounded-xl px-5 py-2.5 whitespace-nowrap font-500 ${
                isActive
                  ? "from-deep-purple to-electric-magenta text-soft-white neon-glow bg-gradient-to-r shadow-lg shadow-electric-magenta/20"
                  : "glass-card hover:border-electric-magenta text-muted-foreground hover:text-soft-white border-2 border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content with proper overflow handling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {activeTab === "now-playing" && (
            <NowPlayingTab currentSong={currentSong} />
          )}
          {activeTab === "chat" && (
            <ChatTab
              messages={chatMessages}
              onSendMessage={onSendMessage}
              currentUserId={currentUserId}
              isConnected={isConnected}
            />
          )}
          {activeTab === "queue" && <QueueTab queue={queue} />}
          {activeTab === "members" && <MembersTab />}
        </div>
      </div>
    </div>
  );
}
