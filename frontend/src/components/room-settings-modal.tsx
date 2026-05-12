"use client";

import { useState } from "react";

import { X, Lock, Users, Music, Volume2, Shield, Crown, Image as ImageIcon, Zap, TrendingUp, ChevronDown } from "lucide-react";
import { SettingsToggle } from "./settings-toggle";
import { SettingsSelect } from "./settings-select";
import { UnsplashImagePicker } from "./ui/unsplash-picker";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  isPrivate: boolean;

  maxListeners: number;
  mood: string;
  cover?: string;
  stats?: {
    totalListeners: number;
    createdAt: string | Date;
  };
  onSave?: (settings: {
    name: string;
    isPrivate: boolean;
    maxListeners: number;
    mood: string;
    cover?: string;
  }) => void;
}

export function RoomSettingsModal({
  isOpen,
  onClose,
  roomName: initialRoomName,
  isPrivate: initialIsPrivate,
  maxListeners: initialMaxListeners,
  mood: initialMood,
  cover: initialCover,
  stats,
  onSave,
}: RoomSettingsModalProps) {
  const [roomName, setRoomName] = useState(initialRoomName);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [maxListeners, setMaxListeners] = useState(initialMaxListeners);
  const [cover, setCover] = useState(initialCover || "");
  const [mood, setMood] = useState(initialMood || "Chill");
  const [showPicker, setShowPicker] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.({
      name: roomName,
      isPrivate,
      maxListeners,

      mood,
      cover,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden pb-[100px]">
      {/* Cinematic Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Premium Modal Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative flex flex-col w-full max-w-2xl h-full max-h-[80vh] bg-surface-low/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Editorial Header */}
        <div className="relative shrink-0 px-8 pt-8 pb-6 border-b border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                 <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic font-space-grotesk">Room Authority</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">System configuration & vibe control</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Intelligence Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-8 py-8 custom-scrollbar">
          <div className="space-y-10 pb-12">
            {/* Room Core Identity */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Music className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Core Identity</span>
                </div>
                
                {/* Room Name Input */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">Identifier</label>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Enter unique signal ID..."
                            maxLength={50}
                            className="relative w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all uppercase tracking-tight"
                        />
                    </div>
                </div>

                {/* Cover Selector */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">Sonic Artwork</label>
                    {cover ? (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden group border border-white/10 shadow-2xl">
                            <img src={cover} alt="Room cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => setShowPicker(!showPicker)}
                                    className="bg-white text-black font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl hover:scale-105 transition-transform"
                                >
                                    Change Interface
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowPicker(!showPicker)}
                            className="w-full aspect-video border border-dashed border-white/10 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center gap-4 text-white/20 hover:text-primary hover:border-primary/50 transition-all group"
                        >
                            <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <ImageIcon className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy Visual Identity</span>
                        </button>
                    )}
                    
                    <AnimatePresence>
                        {showPicker && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 p-4 bg-black/40 rounded-[1.5rem] border border-white/5 backdrop-blur-xl shadow-inner">
                                    <UnsplashImagePicker 
                                        onSelect={(url) => {
                                            setCover(url);
                                            setShowPicker(false);
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Vibe & Transmission Settings */}
            <div className="space-y-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Transmission Config</span>
                </div>

                <SettingsSelect
                    label="Spectral Mood"
                    description="The harmonic foundation of your sanctuary"
                    options={[
                        { value: "Chill", label: "CHILL" },
                        { value: "Lofi", label: "LO-FI" },
                        { value: "Party", label: "PARTY" },
                        { value: "Study", label: "STUDY" },
                        { value: "Focus", label: "FOCUS" },
                        { value: "Ambient", label: "AMBIENT" },
                    ]}
                    defaultValue={mood}
                    onChange={setMood}
                />

                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">Access Protocol</span>
                        <p className="text-[10px] font-medium text-white/20 uppercase tracking-tight pl-1">Control who can tap into your frequency</p>
                    </div>
                    <SettingsToggle
                        label="Darknet Protocol (Private)"
                        description={
                            isPrivate
                                ? "Encryption active: Invite code required"
                                : "Public broadcast: Open to all listeners"
                        }
                        defaultChecked={isPrivate}
                        onChange={setIsPrivate}
                    />
                </div>

                <SettingsSelect
                    label="Bandwidth Capacity"
                    description="Simultaneous listener limit for this session"
                    options={[
                        { value: "50", label: "50 LISTENERS" },
                        { value: "100", label: "100 LISTENERS" },
                        { value: "500", label: "500 LISTENERS" },
                        { value: "1000", label: "1,000 LISTENERS" },
                        { value: "5000", label: "5,000 LISTENERS" },
                        { value: "10000", label: "10,000 LISTENERS" },
                    ]}
                    defaultValue={maxListeners.toString()}
                    onChange={(val) => setMaxListeners(Number(val))}
                />
            </div>

            {/* Performance Analytics */}
            <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 shadow-inner transition-all hover:border-primary/30">
                <div className="absolute -top-4 -right-4 p-3 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
                    <Crown size={120} className="text-primary" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Spectral Analytics</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Total Syncs</p>
                            <p className="text-4xl font-black text-primary tracking-tighter tabular-nums font-space-grotesk italic">
                                {(stats?.totalListeners ?? 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Session Age</p>
                            <p className="text-4xl font-black text-ocean-blue tracking-tighter tabular-nums font-space-grotesk italic">
                                {stats?.createdAt ? (
                                    (() => {
                                        const now = new Date();
                                        const created = new Date(stats.createdAt);
                                        const diffInMs = now.getTime() - created.getTime();
                                        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                                        if (diffInHours < 1) {
                                            const diffInMins = Math.floor(diffInMs / (1000 * 60));
                                            return `${diffInMins}M`;
                                        }
                                        if (diffInHours >= 24) {
                                            const diffInDays = Math.floor(diffInHours / 24);
                                            return `${diffInDays}D`;
                                        }
                                        return `${diffInHours}H`;
                                    })()
                                ) : "0H"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <div className="shrink-0 px-8 py-6 bg-black/40 border-t border-white/5 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          >
            Abort Changes
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 px-6 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Deploy Updates
          </button>
        </div>
      </motion.div>
    </div>
  );
}

