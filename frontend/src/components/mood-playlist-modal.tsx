"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Sparkles, Music, Activity, Zap, Languages, 
  History, MessageSquare, ListMusic, Plus, Minus, 
  Check, Info, HelpCircle
} from "lucide-react";
import { GlassCard } from "./glass-card";

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
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden outline-none animate-in zoom-in-95 duration-500 rounded-3xl">
            {/* Background Glows */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-electric-magenta/20 blur-[100px] rounded-full pointer-events-none" />
            
            <GlassCard className="relative max-h-[90vh] overflow-y-auto border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.4)] p-0 bg-slate-950/40 backdrop-blur-3xl rounded-3xl">
              {/* Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.05] bg-slate-950/20 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-primary to-electric-magenta rounded-2xl p-2.5 shadow-lg shadow-primary/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Dialog.Title className="text-2xl font-bold text-white tracking-tight">Ask Soniq AI Buddy</Dialog.Title>
                      
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="text-white/30 hover:text-white/60 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content 
                            className="z-[60] max-w-[280px] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                            sideOffset={5}
                          >
                            <p className="text-sm text-white/90 leading-relaxed font-medium">
                              Your personal music concierge. We use Gemini AI to analyze your mood, activity, and preferences to curate a perfectly synced queue for your room.
                            </p>
                            <div className="mt-2 text-xs text-white/40 italic">
                              Why it exists: To eliminate "choice paralysis" and keep the vibe consistent without manual searching.
                            </div>
                            <Tooltip.Arrow className="fill-slate-900/90" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                    <p className="text-sm text-white/40 font-medium">Describe your vibe, and I'll handle the rest.</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded-full p-2.5 text-white/40 hover:bg-white/5 hover:text-white transition-all hover:rotate-90 duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-10 p-8">
                {/* Mood Selection */}
                <section>
                  <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-5">
                    😊 What's your mood right now?
                  </h3>
                  <div className="flex flex-wrap gap-3">
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
                  <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-5">
                    <Activity className="h-3.5 w-3.5" /> What are you doing?
                  </h3>
                  <div className="flex flex-wrap gap-3">
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
                <section className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
                      <Zap className="h-3.5 w-3.5 text-yellow-400" /> Energy Level
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
                  <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-5">
                    <Music className="h-3.5 w-3.5" /> Genres <span className="text-[9px] lowercase font-medium opacity-30 ml-1">(pick any)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
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
                  <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-5">
                    <MessageSquare className="h-3.5 w-3.5" /> Describe your vibe <span className="text-[9px] lowercase font-medium opacity-30 ml-1">(optional but powerful)</span>
                  </h3>
                  <textarea 
                    value={vibeText}
                    onChange={(e) => setVibeText(e.target.value)}
                    placeholder="e.g. Rainy night in Kolkata, just got off a long shift, feeling hollow but hopeful..."
                    className="w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-5 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none text-sm leading-relaxed"
                  />
                </section>

                {/* Bottom Controls */}
                <div className="space-y-6 pt-6 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ListMusic className="h-4 w-4 text-white/30" />
                      <span className="text-sm font-semibold text-white/60">Playlist Length</span>
                    </div>
                    <div className="flex items-center gap-5 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.05]">
                      <button 
                        onClick={() => setPlaylistLength(Math.max(5, playlistLength - 5))}
                        className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all active:scale-90"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="min-w-[80px] text-center">
                        <span className="text-xl font-black text-white">{playlistLength}</span>
                        <span className="text-[10px] text-white/20 font-bold block uppercase tracking-wider mt-0.5">songs</span>
                      </div>
                      <button 
                        onClick={() => setPlaylistLength(Math.min(50, playlistLength + 5))}
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
                    />
                    <ToggleOption 
                      label="Instrumental" 
                      enabled={toggles.instrumental}
                      onChange={(v) => setToggles(t => ({ ...t, instrumental: v }))}
                    />
                    <ToggleOption 
                      label="No repeats" 
                      enabled={toggles.noRepeat}
                      onChange={(v) => setToggles(t => ({ ...t, noRepeat: v }))}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleGenerate}
                  className="group relative w-full bg-gradient-to-r from-primary to-electric-magenta text-white font-black py-6 rounded-3xl shadow-[0_15px_40px_rgba(255,51,102,0.25)] hover:shadow-[0_20px_50px_rgba(255,51,102,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative flex items-center justify-center gap-3 text-lg tracking-tight uppercase">
                    Sync Vibe Now
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </span>
                </button>
                
                <p className="text-center text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">
                  Powered by Gemini 1.5 Pro
                </p>
              </div>
            </GlassCard>
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

function ToggleOption({ label, enabled, onChange }: { label: string, enabled: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-4 hover:bg-white/[0.05] transition-all">
      <span className="text-[11px] font-bold tracking-wider text-white/40 uppercase">{label}</span>
      <Switch.Root 
        checked={enabled} 
        onCheckedChange={onChange}
        className={`w-10 h-5 rounded-full relative transition-all outline-none cursor-pointer ${enabled ? "bg-primary" : "bg-white/10"}`}
      >
        <Switch.Thumb className={`block w-3 h-3 bg-white rounded-full transition-transform duration-300 translate-x-1 will-change-transform ${enabled ? "translate-x-6" : ""}`} />
      </Switch.Root>
    </div>
  );
}
