"use client";

import { useState, useEffect } from "react";
import { 
  Search, Headphones, Moon, Heart, PartyPopper, 
  Coffee, Users, Music2, Music, Sparkles, 
  TrendingUp, Globe, Compass, Mic2, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomCard } from "@frontend/components/room-card";
import { BottomNowPlaying } from "@frontend/components/bottom-now-playing";
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
    <div className="bg-slate-950 text-white min-h-screen pb-32 overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-electric-magenta/10 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        {/* Hero Section */}
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-[0.3em] uppercase text-[10px]">
              <Compass className="h-4 w-4" />
              Discover the Vibe
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
              Pulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-electric-magenta to-indigo-400">Network.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mb-10 leading-relaxed">
              Join thousands of listeners in live social rooms. Search by mood, genre, or activity and find your sonic community.
            </p>

            {/* Search Bar */}
            <div className="relative group max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-electric-magenta/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-[2rem] p-2 focus-within:border-primary/50 transition-all backdrop-blur-xl">
                <div className="pl-6 pr-4 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>
                <input 
                  type="text"
                  placeholder="What's your sound today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-4 text-lg font-semibold placeholder:text-slate-600 focus:outline-none"
                />
                <button className="bg-white/5 hover:bg-white/10 text-white/60 px-6 py-4 rounded-3xl font-bold text-sm transition-all active:scale-95">
                  Search
                </button>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Categories Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
              <Radio className="h-4 w-4 text-primary" /> Popular Tags
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  relative px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap
                  ${selectedCategory === category 
                    ? "bg-primary text-white shadow-[0_10px_20px_rgba(147,51,234,0.3)] scale-105" 
                    : "bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Matrix */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
              <Sparkles className="h-4 w-4 text-yellow-400" /> Vibe Matrix
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                className={`
                  group relative flex flex-col items-center justify-center gap-4 aspect-square rounded-[2rem] border transition-all overflow-hidden
                  ${selectedMood === mood.id 
                    ? "bg-primary border-primary shadow-[0_20px_40px_rgba(147,51,234,0.25)]" 
                    : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10"
                  }
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} to-transparent opacity-50`} />
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500 z-10">{mood.emoji}</span>
                <span className={`text-[10px] font-black tracking-[0.2em] uppercase z-10 ${selectedMood === mood.id ? "text-white" : "text-slate-500"}`}>
                  {mood.label}
                </span>
                {selectedMood === mood.id && (
                  <motion.div layoutId="mood-active" className="absolute inset-0 border-2 border-white/20 rounded-[2rem]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Main Room Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Active Communities
            </h2>
            <div className="h-[1px] flex-1 bg-white/[0.05] mx-8" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{rooms.length} Rooms Found</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-video bg-white/[0.03] rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-40 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Radio className="h-10 w-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Silence in the air.</h3>
              <p className="text-slate-500">Try adjusting your filters or searching for something else.</p>
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
                    host={typeof room.hostId === "object" ? room.hostId?.username || "Soniq Host" : "Soniq Host"}
                    thumbnail={room.cover}
                    isLive={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Quick Join / Rising */}
        <section className="mb-20">
           <div className="flex items-center gap-4 mb-8">
             <div className="bg-electric-magenta/20 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-electric-magenta" />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight">Rising Tides</h2>
                <p className="text-slate-500 text-sm">Rooms gaining momentum in the last hour.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.slice(0, 4).map((room) => (
                <Link 
                  key={room._id} 
                  href={`/room/${room._id || ""}`}
                  className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/[0.05] rounded-[2rem] hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-2xl">
                       <img src={room.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000"} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/20" />
                    </div>
                    <div>
                       <h3 className="font-black text-lg group-hover:text-primary transition-colors">{room.name}</h3>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Users className="h-3 w-3" />
                          <span>{room.listenerCount} Vibes</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full" />
                          <span>{room.mood || "Mixed"}</span>
                       </div>
                    </div>
                  </div>
                  <div className="bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-primary transition-all">
                    Sync
                  </div>
                </Link>
              ))}
           </div>
        </section>
      </div>

      <BottomNowPlaying />
    </div>
  );
}
