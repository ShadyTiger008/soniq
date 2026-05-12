"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Sparkles, Music, Activity, Zap, Languages, 
  History, MessageSquare, ListMusic, Plus, Minus, 
  Check, Info, HelpCircle
} from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./ui/button";
import { cn } from "@frontend/lib/utils";

interface MoodPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

const moods = [
  { id: "happy", label: "Happy", icon: "😊" },
  { id: "sad", label: "Sad", icon: "😢" },
  { id: "angry", label: "Angry", icon: "😠" },
  { id: "romantic", label: "Romantic", icon: "💖" },
  { id: "nostalgic", label: "Nostalgic", icon: "🎞️" },
  { id: "anxious", label: "Anxious", icon: "😰" },
  { id: "calm", label: "Calm", icon: "🧘" },
  { id: "motivated", label: "Motivated", icon: "🔥" },
  { id: "heartbroken", label: "Heartbroken", icon: "💔" },
  { id: "lonely", label: "Lonely", icon: "👤" },
];

const activities = [
  { id: "study", label: "Studying / focus", icon: "📚" },
  { id: "workout", label: "Working out", icon: "💪" },
  { id: "driving", label: "Driving", icon: "🚗" },
  { id: "cooking", label: "Cooking", icon: "🍳" },
  { id: "party", label: "Party", icon: "🎉" },
  { id: "sleep", label: "Sleeping / wind down", icon: "🌙" },
  { id: "chilling", label: "Chilling", icon: "🥤" },
  { id: "late", label: "Working late", icon: "🌃" },
  { id: "morning", label: "Morning routine", icon: "☀️" },
];

const genres = [
  "Lo-fi", "Pop", "Hip-hop", "Rock", "Classical", "Jazz", "EDM", "R&B/Soul", 
  "Indie", "Bollywood", "K-pop", "Metal", "Folk / Acoustic", "Ambient"
];

const eras = ["70s", "80s", "90s", "2000s", "2010s", "Latest hits", "Mix of all"];

const languages = ["Hindi", "English", "Bengali", "Tamil", "Telugu", "Korean", "Spanish", "No pref"];

export function MoodPlaylistModal({ isOpen, onClose, onGenerate }: MoodPlaylistModalProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("No pref");
  const [vibeText, setVibeText] = useState("");
  const [playlistLength, setPlaylistLength] = useState(10);
  const [experienceType, setExperienceType] = useState<"single" | "small" | "medium" | "large">("small");
  
  const [toggles, setToggles] = useState({
    lesserKnown: false,
    instrumental: false,
    noRepeat: false,
  });

  const currentEnergy = energyLevel[0] ?? 5;


  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleGenerate = () => {
    onGenerate({
      mood: selectedMood,
      activity: selectedActivity,
      energy: currentEnergy,
      genres: selectedGenres,
      era: selectedEra,
      language: selectedLanguage,
      vibe: vibeText,
      length: playlistLength,
      ...toggles
    });
    onClose();
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md animate-in fade-in duration-500" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[101] !w-[60vw] !max-w-[70vw] -translate-x-1/2 -translate-y-1/2 p-0 overflow-hidden bg-black/40 backdrop-blur-[100px] border border-white/[0.08] rounded-[2.5rem] h-[80vh] flex flex-col shadow-[0_0_120px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500">
            {/* Cinematic Background Mesh */}
            <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
            
            {/* Dynamic Ambient Glows */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/30 blur-[150px] rounded-full pointer-events-none" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-electric-magenta/30 blur-[150px] rounded-full pointer-events-none" 
            />

            {/* Refined Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-white/[0.05] bg-black/20 px-6 py-5 backdrop-blur-3xl relative z-30">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-electric-magenta blur-lg opacity-30 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-primary to-electric-magenta rounded-xl p-2 shadow-2xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Dialog.Title className="text-lg font-black text-white tracking-tighter uppercase italic font-space-grotesk">Vibecue AI Buddy</Dialog.Title>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button className="text-white/20 hover:text-white/60 transition-colors p-1">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content 
                          className="z-[200] max-w-[280px] bg-black/80 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                          sideOffset={10}
                        >
                          <p className="text-xs text-white/80 leading-relaxed font-bold tracking-tight">
                            Your personal music concierge. We use Vibecue Buddy AI to analyze your mood, activity, and preferences to curate a perfectly synced queue.
                          </p>
                          <Tooltip.Arrow className="fill-black/80" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>
                  <Dialog.Description className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">Next-Gen Curation Engine</Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white text-white/40 transition-all border border-white/5">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <ScrollArea.Root className="flex-1 min-h-0">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="space-y-8 p-6">
                  {/* Mood Selection */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-4">
                      😊 Mood
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((mood) => (
                        <Chip 
                          key={mood.id} 
                          selected={selectedMood === mood.id}
                          onClick={() => setSelectedMood(mood.id)}
                        >
                          {mood.icon} {mood.label}
                        </Chip>
                      ))}
                    </div>
                  </section>

                  {/* Activity Selection */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-4">
                      <Activity className="h-3 w-3" /> Activity
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activities.map((activity) => (
                        <Chip 
                          key={activity.id} 
                          selected={selectedActivity === activity.id}
                          onClick={() => setSelectedActivity(activity.id)}
                        >
                          {activity.icon} {activity.label}
                        </Chip>
                      ))}
                    </div>
                  </section>

                  {/* Energy Level Slider */}
                  <section className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                        <Zap className="h-3 w-3 text-yellow-400" /> Energy
                      </h3>
                      <span className="text-[10px] font-bold tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 uppercase">
                        {currentEnergy <= 3 ? "Mellow" : currentEnergy <= 7 ? "Balanced" : "Full Hype"} ({currentEnergy})
                      </span>
                    </div>
                    <div className="px-2">
                      <Slider.Root 
                        className="relative flex items-center select-none touch-none w-full h-5"
                        value={energyLevel}
                        onValueChange={setEnergyLevel}
                        max={10}
                        step={1}
                      >
                        <Slider.Track className="bg-white/5 relative grow rounded-full h-2">
                          <Slider.Range className="absolute bg-gradient-to-r from-primary to-electric-magenta rounded-full h-full shadow-[0_0_15px_rgba(255,51,102,0.3)]" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-6 h-6 bg-white border-[3px] border-primary rounded-full shadow-2xl focus:outline-none hover:scale-110 transition-transform cursor-grab active:cursor-grabbing ring-4 ring-primary/10" />
                      </Slider.Root>
                      <div className="flex justify-between mt-3 px-1">
                        <span className="text-[10px] text-white/20 font-bold tracking-widest uppercase">DEAD QUIET</span>
                        <span className="text-[10px] text-white/20 font-bold tracking-widest uppercase">PEAK HYPE</span>
                      </div>
                    </div>
                  </section>

                  {/* Genres Selection */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-4">
                      <Music className="h-3 w-3" /> Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <Chip 
                          key={genre} 
                          selected={selectedGenres.includes(genre)}
                          onClick={() => toggleGenre(genre)}
                          compact
                        >
                          {genre}
                        </Chip>
                      ))}
                    </div>
                  </section>

                  {/* Era & Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                      <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-5">
                        <History className="h-3.5 w-3.5" /> Era
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {eras.map((era) => (
                          <Chip 
                            key={era} 
                            selected={selectedEra === era}
                            onClick={() => setSelectedEra(era)}
                            compact
                          >
                            {era}
                          </Chip>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-5">
                        <Languages className="h-3.5 w-3.5" /> Language
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {languages.map((lang) => (
                          <Chip 
                            key={lang} 
                            selected={selectedLanguage === lang}
                            onClick={() => setSelectedLanguage(lang)}
                            compact
                          >
                            {lang}
                          </Chip>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Free Text Box */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-4">
                      <MessageSquare className="h-3 3" /> Describe Vibe
                    </h3>
                    <textarea 
                      value={vibeText}
                      onChange={(e) => setVibeText(e.target.value)}
                      placeholder="e.g. Rainy night, long shift, feeling hopeful..."
                      className="w-full h-24 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none text-xs leading-relaxed"
                    />
                  </section>

                  {/* Experience Type */}
                  <section className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
                    <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-6">
                      ✨ Experience
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { 
                          id: "single", label: "Single", icon: "🎵", count: 1,
                          tip: "1 Song"
                        },
                        { 
                          id: "small", label: "EP", icon: "💿", count: 5,
                          tip: "5 Songs"
                        },
                        { 
                          id: "medium", label: "Album", icon: "📀", count: 15,
                          tip: "15 Songs"
                        },
                        { 
                          id: "large", label: "Fest", icon: "🏟️", count: 35,
                          tip: "35 Songs"
                        },
                      ].map((type) => (
                        <Tooltip.Root key={type.id}>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={() => {
                                setExperienceType(type.id as any);
                                setPlaylistLength(type.count);
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition-all duration-500 relative group overflow-hidden",
                                experienceType === type.id 
                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(29,185,84,0.1)]" 
                                : "border-white/[0.05] bg-white/[0.02] text-white/20 hover:bg-white/[0.05] hover:text-white/60"
                              )}
                            >
                              <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">{type.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-[0.1em] font-space-grotesk italic">{type.label}</span>
                              
                              {experienceType === type.id && (
                                 <motion.div layoutId="type-glow" className="absolute inset-0 bg-primary/5 pointer-events-none" />
                              )}
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content 
                              className="z-[200] max-w-[240px] bg-black/90 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                              sideOffset={10}
                            >
                              <p className="text-[11px] text-white font-bold leading-relaxed tracking-tight uppercase italic">{type.tip}</p>
                              <Tooltip.Arrow className="fill-black/90" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      ))}
                    </div>
                  </section>

                  {/* Bottom Controls */}
                  <div className="space-y-6 pt-6 border-t border-white/[0.05]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ListMusic className="h-4 w-4 text-white/30" />
                        <span className="text-sm font-semibold text-white/60">Playlist Length</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-5 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.05] transition-all",
                        experienceType === "single" && "opacity-30 pointer-events-none grayscale"
                      )}>
                        <button 
                          onClick={() => setPlaylistLength(Math.max(5, playlistLength - 5))}
                          disabled={experienceType === "single"}
                          className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all active:scale-90"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="min-w-[80px] text-center">
                          <span className="text-xl font-black text-white">{experienceType === "single" ? 1 : playlistLength}</span>
                          <span className="text-[10px] text-white/20 font-bold block uppercase tracking-wider mt-0.5">songs</span>
                        </div>
                        <button 
                          onClick={() => setPlaylistLength(Math.min(50, playlistLength + 5))}
                          disabled={experienceType === "single"}
                          className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all active:scale-90"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <ToggleOption 
                        label="Lesser-known" 
                        enabled={toggles.lesserKnown}
                        onChange={(v) => setToggles(t => ({ ...t, lesserKnown: v }))}
                        tip="HIDDEN GEMS: Prioritize underground artists and niche tracks over mainstream hits."
                      />
                      <ToggleOption 
                        label="Instrumental" 
                        enabled={toggles.instrumental}
                        onChange={(v) => setToggles(t => ({ ...t, instrumental: v }))}
                        tip="FOCUS MODE: Filter for tracks without vocals. Perfect for work, study, or sleep."
                      />
                      <ToggleOption 
                        label="No repeats" 
                        enabled={toggles.noRepeat}
                        onChange={(v) => setToggles(t => ({ ...t, noRepeat: v }))}
                        tip="FRESH VIBES: Ensure no songs already in your recent history appear in this batch."
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-black/10 transition-colors duration-[160ms] ease-out hover:bg-black/20 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5" orientation="vertical">
                <ScrollArea.Thumb className="flex-1 bg-white/10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            {/* Cinematic Action Footer */}
            <div className="shrink-0 p-6 bg-black/40 border-t border-white/[0.05] backdrop-blur-3xl space-y-4 relative z-30">
              <Button
                onClick={handleGenerate}
                className="group relative w-full h-[52px] bg-transparent text-white font-black rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] border border-white/[0.05]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-electric-magenta to-primary bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] opacity-60" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                
                <span className="relative flex items-center justify-center gap-2 text-[14px] tracking-[0.2em] uppercase font-space-grotesk italic">
                  Sync Vibe Now
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </span>
              </Button>
              
              <p className="text-center text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">
                Powered by Vibecue Buddy AI
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Tooltip.Provider>
  );
}

function Chip({ children, selected, onClick, compact }: { children: React.ReactNode, selected: boolean, onClick: () => void, compact?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden transition-all duration-500
        ${compact ? "px-4 py-2 text-[13px]" : "px-6 py-3.5 text-sm"} 
        font-semibold rounded-2xl border
        ${selected 
          ? "bg-gradient-to-br from-primary to-electric-magenta border-white/20 text-white shadow-[0_10px_20px_rgba(255,51,102,0.2)] ring-1 ring-white/30" 
          : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/80"
        }
      `}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {selected && (
        <motion.div 
          layoutId="chip-active"
          className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" 
        />
      )}
    </motion.button>
  );
}

function ToggleOption({ label, enabled, onChange, tip }: { label: string, enabled: boolean, onChange: (v: boolean) => void, tip?: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-4 hover:bg-white/[0.05] transition-all cursor-help">
          <span className="text-[11px] font-bold tracking-wider text-white/40 uppercase">{label}</span>
          <Switch.Root 
            checked={enabled} 
            onCheckedChange={onChange}
            className={cn(
              "w-10 h-5 rounded-full relative transition-all outline-none cursor-pointer",
              enabled ? "bg-primary" : "bg-white/10"
            )}
          >
            <Switch.Thumb className={cn(
              "block w-3 h-3 bg-white rounded-full transition-transform duration-300 translate-x-1 will-change-transform",
              enabled ? "translate-x-6" : ""
            )} />
          </Switch.Root>
        </div>
      </Tooltip.Trigger>
      {tip && (
        <Tooltip.Portal>
          <Tooltip.Content 
            className="z-[200] max-w-[240px] bg-black/90 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            sideOffset={10}
          >
            <p className="text-[11px] text-white/80 font-bold leading-relaxed tracking-tight uppercase italic">{tip}</p>
            <Tooltip.Arrow className="fill-black/90" />
          </Tooltip.Content>
        </Tooltip.Portal>
      )}
    </Tooltip.Root>
  );
}
