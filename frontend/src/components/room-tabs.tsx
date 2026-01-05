"use client";

import { useState } from "react";
import { Music, MessageCircle, List, Users } from "lucide-react";
import { NowPlayingTab } from "./tabs/now-playing-tab";
import { ChatTab } from "./tabs/chat-tab";
import { QueueTab } from "./tabs/queue-tab";
import { MembersTab } from "./tabs/members-tab";

type TabType = "now-playing" | "chat" | "queue" | "members";

import type { Song, ChatMessage, RoomMember } from "@frontend/types";

interface RoomTabsProps {
  queue?: Song[];
  currentSong?: Song | null;
  chatMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
  isConnected?: boolean;
  roomMembers?: RoomMember[];
  isHost?: boolean;
  onReorderQueue?: (fromIndex: number, toIndex: number) => void;
  onRequestSong?: (song: Song) => void;
  requests?: Song[];
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
  onRemoveSong?: (id: string) => void;
  onPlaySong?: (id: string) => void;
  onUpdateRole?: (userId: string, role: "dj" | "listener") => void;
  onKickMember?: (userId: string) => void;
}

export function RoomTabs({
  queue = [],
  currentSong = null,
  chatMessages = [],
  onSendMessage,
  currentUserId,
  isConnected = false,
  roomMembers = [],
  isHost = false,
  onReorderQueue,
  onRequestSong,
  requests = [],
  onApproveRequest,
  onRejectRequest,
  onRemoveSong,
  onPlaySong,
  onUpdateRole,
  onKickMember,
}: RoomTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  const tabs = [
    { id: "now-playing", label: "Now Playing", icon: Music, emoji: "♫" },
    { id: "chat", label: "Chat", icon: MessageCircle, emoji: "💬" },
    { id: "queue", label: "Up Next", icon: List, emoji: "📋" },
    { id: "members", label: "Members", icon: Users, emoji: "👥" },
  ] as const;

  return (
    <div className="flex h-full w-full flex-col bg-card">
      {/* Tab navigation with Premium Design */}
      <div className="flex gap-2 overflow-x-auto border-b border-border p-2 scrollbar-hide bg-muted/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`smooth-transition flex items-center gap-2 rounded-lg px-4 py-3 whitespace-nowrap font-medium text-sm flex-1 justify-center ${
                isActive
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content with proper overflow handling */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto">
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
          {activeTab === "queue" && (
            <QueueTab
              queue={queue}
              requests={requests}
              onReorderQueue={onReorderQueue}
              isHost={isHost}
              onRequestSong={onRequestSong}
              onApproveRequest={onApproveRequest}
              onRejectRequest={onRejectRequest}
              onRemoveSong={onRemoveSong}
              onPlaySong={onPlaySong}
              currentUserId={currentUserId}
            />
          )}
          {activeTab === "members" && (
            <MembersTab
              members={roomMembers}
              currentUserId={currentUserId}
              isHost={isHost}
              onPromoteDJ={(id) => onUpdateRole?.(id, 'dj')}
              onDemote={(id) => onUpdateRole?.(id, 'listener')}
              onKick={onKickMember}
            />
          )}
        </div>
      </div>
    </div>
  );
}
