"use client";

import { useState } from "react";
import { X, Lock, Users, Music, Volume2, Shield, Crown } from "lucide-react";
import { SettingsToggle } from "./settings-toggle";
import { SettingsSelect } from "./settings-select";

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  isPrivate: boolean;
  maxListeners: number;
  onSave?: (settings: {
    name: string;
    isPrivate: boolean;
    maxListeners: number;
    mood: string;
  }) => void;
}

export function RoomSettingsModal({
  isOpen,
  onClose,
  roomName: initialRoomName,
  isPrivate: initialIsPrivate,
  maxListeners: initialMaxListeners,
  onSave,
}: RoomSettingsModalProps) {
  const [roomName, setRoomName] = useState(initialRoomName);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [maxListeners, setMaxListeners] = useState(initialMaxListeners);
  const [mood, setMood] = useState("Chill");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.({
      name: roomName,
      isPrivate,
      maxListeners,
      mood,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="glass-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-deep-purple/20 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-deep-purple to-electric-magenta flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="font-heading font-700 text-2xl">Room Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="smooth-transition text-muted-foreground hover:text-soft-white rounded-lg p-2 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="font-600 text-soft-white mb-2 block text-sm">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              maxLength={50}
              className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta smooth-transition w-full rounded-lg border-2 border-deep-purple/30 bg-[rgba(26,22,51,0.6)] px-4 py-3 focus:outline-none"
            />
          </div>

          {/* Mood */}
          <SettingsSelect
            label="Room Mood"
            description="Set the vibe for your room"
            options={[
              { value: "Chill", label: "Chill" },
              { value: "Lofi", label: "Lofi" },
              { value: "Party", label: "Party" },
              { value: "Study", label: "Study" },
              { value: "Focus", label: "Focus" },
              { value: "Ambient", label: "Ambient" },
            ]}
            defaultValue={mood}
            onChange={setMood}
          />

          {/* Privacy */}
          <div>
            <label className="font-600 text-soft-white mb-3 block text-sm">
              Privacy Settings
            </label>
            <SettingsToggle
              label="Private Room"
              description={
                isPrivate
                  ? "Only people with invite code can join"
                  : "Anyone can join this room"
              }
              defaultChecked={isPrivate}
              onChange={setIsPrivate}
            />
          </div>

          {/* Max Listeners */}
          <div>
            <label className="font-600 text-soft-white mb-2 block text-sm">
              Maximum Listeners
            </label>
            <select
              value={maxListeners}
              onChange={(e) => setMaxListeners(Number.parseInt(e.target.value))}
              className="text-soft-white smooth-transition w-full rounded-lg border-2 border-deep-purple/30 bg-[rgba(26,22,51,0.6)] px-4 py-3 focus:border-electric-magenta focus:outline-none"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
            </select>
          </div>

          {/* Room Stats */}
          <div className="border-deep-purple/20 rounded-xl border p-4">
            <h3 className="font-600 text-soft-white mb-3 flex items-center gap-2 text-sm">
              <Crown className="text-electric-magenta h-4 w-4" />
              Room Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Total Listeners</p>
                <p className="font-700 text-electric-magenta text-lg">1,234</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Room Age</p>
                <p className="font-700 text-ocean-blue text-lg">24h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="glass-card hover:border-ocean-blue text-soft-white font-600 smooth-transition flex-1 rounded-lg px-4 py-3"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink text-soft-white font-600 smooth-transition neon-glow flex-1 rounded-lg bg-gradient-to-r px-4 py-3 shadow-lg shadow-electric-magenta/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

