"use client";

import { useState } from "react";

import { X, Lock, Users, Music, Volume2, Shield, Crown, Image as ImageIcon } from "lucide-react";
import { SettingsToggle } from "./settings-toggle";
import { SettingsSelect } from "./settings-select";
import { UnsplashImagePicker } from "./ui/unsplash-picker";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="glass-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-electric-magenta flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r">
               <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-heading font-700 text-2xl text-foreground">Room Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="smooth-transition text-muted-foreground hover:text-foreground rounded-lg p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="font-600 text-foreground mb-2 block text-sm">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              maxLength={50}
              className="text-foreground placeholder-muted-foreground focus:border-primary border-border smooth-transition w-full rounded-lg border bg-muted/30 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Cover Image */}
          <div>
             <label className="font-600 text-foreground mb-2 block text-sm">
               Room Cover
             </label>
             {cover ? (
                 <div className="relative aspect-video w-full rounded-lg overflow-hidden group border border-border">
                     <img src={cover} alt="Room cover" className="w-full h-full object-cover" />
                     <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors"
                     >
                         Change Cover
                     </button>
                 </div>
             ) : (
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-full border border-dashed border-border bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                >
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Select Cover Image</span>
                </button>
             )}
             
             {showPicker && (
                 <div className="mt-2 p-2 bg-muted/50 rounded-lg border border-border">
                     <UnsplashImagePicker 
                        onSelect={(url) => {
                            setCover(url);
                            setShowPicker(false);
                        }}
                     />
                 </div>
             )}
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
            <label className="font-600 text-foreground mb-3 block text-sm">
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
          <SettingsSelect
            label="Maximum Listeners"
            description="Limit the number of people who can join"
            options={[
              { value: "50", label: "50" },
              { value: "100", label: "100" },
              { value: "500", label: "500" },
              { value: "1000", label: "1,000" },
              { value: "5000", label: "5,000" },
              { value: "10000", label: "10,000" },
            ]}
            defaultValue={maxListeners.toString()}
            onChange={(val) => setMaxListeners(Number(val))}
          />

          {/* Room Stats */}
          <div className="border-border bg-muted/30 group hover:border-primary/40 smooth-transition overflow-hidden rounded-xl border p-5 relative">
             <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Crown size={64} className="text-primary" />
             </div>
            <h3 className="font-600 text-foreground mb-4 flex items-center gap-2 text-sm">
              <Crown className="text-primary h-4 w-4" />
              Room Statistics
            </h3>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Total Listeners</p>
                <p className="font-800 text-primary text-2xl tabular-nums">
                    {(stats?.totalListeners ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Room Age</p>
                <p className="font-800 text-ocean-blue text-2xl tabular-nums">
                    {stats?.createdAt ? (
                        (() => {
                            const now = new Date();
                            const created = new Date(stats.createdAt);
                            const diffInMs = now.getTime() - created.getTime();
                            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                            if (diffInHours < 1) {
                                const diffInMins = Math.floor(diffInMs / (1000 * 60));
                                return `${diffInMins}m`;
                            }
                            if (diffInHours >= 24) {
                                const diffInDays = Math.floor(diffInHours / 24);
                                return `${diffInDays}d`;
                            }
                            return `${diffInHours}h`;
                        })()
                    ) : "0h"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="border border-border hover:bg-muted text-foreground font-semibold smooth-transition flex-1 rounded-xl px-4 py-4"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold smooth-transition flex-1 rounded-xl px-4 py-4 shadow-lg shadow-primary/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

