"use client";

import { useState } from "react";
import { Music, MessageCircle, List, Users, Sparkles } from "lucide-react";
import { NowPlayingTab } from "./tabs/now-playing-tab";
import { ChatTab } from "./tabs/chat-tab";
import { QueueTab } from "./tabs/queue-tab";
import { MembersTab } from "./tabs/members-tab";
import { motion, AnimatePresence } from "framer-motion";

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
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
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
  activeTab: controlledTab,
  onTabChange,
}: RoomTabsProps) {
  const [internalTab, setInternalTab] = useState<TabType>("chat");
  const activeTab = controlledTab || internalTab;

  const handleTabChange = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const tabs = [
    { id: "now-playing", label: "Live", icon: Music },
    { id: "chat", label: "Pulse", icon: MessageCircle },
    { id: "queue", label: "Lineup", icon: List },
    { id: "members", label: "Vibe", icon: Users },
  ] as const;

  return (
    <div className="flex h-full w-full flex-col bg-surface-high/50 backdrop-blur-xl">
      {/* Premium Tab Navigation */}
      <div className="relative flex items-center justify-between gap-1 p-2 bg-black/20 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={cn(
                "relative flex-1 flex flex-col items-center gap-1.5 py-4 transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-tab-glow"
                  className="absolute inset-x-2 inset-y-1 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_var(--sonic-glow)]"
                />
              )}
              <Icon className={cn("h-5 w-5 relative z-10", isActive ? "animate-pulse" : "")} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area with Staggered Entrance */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto scrollbar-hide py-4"
          >
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Small helper for CN inside this file
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
