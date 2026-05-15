"use client";

import { AppShell } from "@frontend/components/layout/app-shell";
import { useState, useEffect } from "react";
import { 
  Search, Headphones, Moon, Heart, PartyPopper, 
  Coffee, Users, Music2, Music, Sparkles, 
  TrendingUp, Globe, Compass, Mic2, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomCard } from "@frontend/components/room-card";
import { BottomNowPlaying } from "@frontend/components/bottom-now-playing";
import { AIPlaylistGenerator } from "@frontend/components/ai-playlist-generator";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import type { Room } from "@frontend/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Featured", "Trending", "Lofi", "Study", "Party", "Chill", "Romance", "Gaming"];

  const moods = [
    { id: "Focus", label: "Focus", emoji: "🧠", color: "from-blue-500/20" },
    { id: "Sleep", label: "Sleep", emoji: "🌙", color: "from-indigo-500/20" },
    { id: "Study", label: "Study", emoji: "📚", color: "from-emerald-500/20" },
    { id: "Party", label: "Party", emoji: "🕺", color: "from-pink-500/20" },
    { id: "Chill", label: "Chill", emoji: "🌊", color: "from-cyan-500/20" },
    { id: "Romance", label: "Romance", emoji: "🕯️", color: "from-red-500/20" },
    { id: "Coffee", label: "Coffee", emoji: "☕", color: "from-orange-500/20" },
  ];

  useEffect(() => {
    fetchRooms();
  }, [selectedMood, searchQuery, selectedCategory]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getRooms({
        limit: 50,
        mood: selectedMood || undefined,
        search: searchQuery || undefined,
        // We'll use category to influence search if needed
      });
      if (response.success && response.data) {
        const data = response.data as any;
        const fetchedRooms = data.rooms || data || [];
        setRooms(fetchedRooms);
      } else {
        toast.error(response.error || "Failed to load rooms");
      }
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-screen bg-background pb-40 selection:bg-primary selection:text-white overflow-x-hidden">
        
        {/* Cinematic Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-electric-magenta/5 blur-[150px] rounded-full animate-pulse-slow" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-24">
            
            {/* Hero Section - Scaled Down for Premium Feel */}
            <header className="mb-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl"
                >
                    <div className="flex items-center gap-3 mb-6 text-primary font-black tracking-[0.4em] uppercase text-[9px]">
                        <Compass className="h-4 w-4" />
                        Exploring the Frequencies
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none font-space-grotesk italic uppercase">
                        Pulse <span className="text-primary">Network.</span>
                    </h1>
                    <p className="text-white/40 text-sm md:text-base font-bold max-w-xl mb-12 leading-relaxed uppercase tracking-tight">
                        Discover live vibecue sanctuaries. Filter by mood, genre, or vibe and join the global sync.
                    </p>

                    {/* Search Cockpit */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="relative group flex-1">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-2xl focus-within:border-primary/50 transition-all backdrop-blur-3xl p-1">
                                <div className="pl-5 pr-3 text-white/20">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="SEARCH BY MOOD, ARTIST, OR ROOM..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none py-3.5 text-xs font-black text-white placeholder:text-white/10 focus:outline-none uppercase tracking-widest"
                                />
                            </div>
                        </div>
                        <AIPlaylistGenerator />
                    </div>
                </motion.div>
            </header>

            {/* Tag Navigator */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    <h2 className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase italic">Trending Tags</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`
                                px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border
                                ${selectedCategory === category 
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                    : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05] hover:text-white"
                                }
                            `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vibe Matrix - High Density */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <h2 className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase italic">Vibe Matrix</h2>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                            className={`
                                group relative flex flex-col items-center justify-center gap-3 aspect-square rounded-3xl border transition-all overflow-hidden
                                ${selectedMood === mood.id 
                                    ? "bg-primary/10 border-primary shadow-xl shadow-primary/10" 
                                    : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                                }
                            `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} to-transparent opacity-20`} />
                            <span className="text-3xl group-hover:scale-110 transition-transform duration-500 z-10">{mood.emoji}</span>
                            <span className={`text-[8px] font-black tracking-[0.2em] uppercase z-10 ${selectedMood === mood.id ? "text-primary" : "text-white/20"}`}>
                                {mood.label}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Active Frequencies Grid */}
            <section className="mb-24">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <h2 className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase italic">Active Frequencies</h2>
                    </div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">{rooms.length} Channels Syncing</span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-video bg-white/[0.02] rounded-[2rem] animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-32 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Radio className="h-8 w-8 text-white/10" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-white/40 italic">Static Detected</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Adjust your frequency to find a signal.</p>
                    </div>
                ) : (
                    <motion.div 
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {rooms.map((room) => (
                            <motion.div key={room._id} variants={item}>
                                <RoomCard
                                    id={room._id || ""}
                                    title={room.name}
                                    listeners={room.listenerCount}
                                    mood={room.mood || "Mixed"}
                                    host={typeof room.hostId === "object" ? room.hostId?.username || "DJ" : "DJ"}
                                    thumbnail={room.cover}
                                    isLive={true}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* Rising Tides - Editorial List */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-10">
                    <TrendingUp className="h-4 w-4 text-electric-magenta" />
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-black tracking-tighter uppercase italic font-space-grotesk">Rising Tides</h2>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Trending waves in the last hour</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.slice(0, 4).map((room) => (
                        <Link 
                            key={room._id} 
                            href={`/room/${room._id || ""}`}
                            className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                                    <img src={room.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000"} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-base group-hover:text-primary transition-colors truncate uppercase font-space-grotesk italic tracking-tight">{room.name}</h3>
                                    <div className="flex items-center gap-3 text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-2.5 w-2.5" />
                                            <span>{room.listenerCount} Vibes</span>
                                        </div>
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <span>{room.mood || "Mixed"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-primary transition-all text-white/40 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                                Sync
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </AppShell>
  );
}
