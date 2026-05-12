"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Headphones, Moon, Heart, PartyPopper, Coffee, Music2, X, ArrowLeft, Sparkles, Zap, Radio } from "lucide-react";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import { useDebounce } from "@uidotdev/usehooks";
import { AppShell } from "@frontend/components/layout/app-shell";
import { motion, AnimatePresence } from "framer-motion";

interface Room {
  _id: string;
  name: string;
  hostId?: any;
  listenerCount: number;
  mood: string;
  currentSong?: any;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      fetchRooms(debouncedSearchQuery);
    } else {
      setRooms([]);
      setHasSearched(false);
    }
  }, [debouncedSearchQuery]);

  const fetchRooms = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await apiClient.getRooms({
        search: query,
        limit: 20,
      });
      if (response.success && response.data) {
        const data = response.data as any;
        setRooms(data.rooms || data || []);
      }
    } catch (error) {
      console.error("Search failed", error);
      toast.error("Failed to fetch results");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setRooms([]);
    setHasSearched(false);
  };

  const moods = [
    { id: "Chill", icon: Coffee, label: "CHILL", color: "from-emerald-500/20 to-emerald-500/5", textColor: "text-emerald-400" },
    { id: "Study", icon: Heart, label: "STUDY", color: "from-rose-500/20 to-rose-500/5", textColor: "text-rose-400" },
    { id: "Party", icon: PartyPopper, label: "PARTY", color: "from-amber-500/20 to-amber-500/5", textColor: "text-amber-400" },
    { id: "Focus", icon: Headphones, label: "FOCUS", color: "from-blue-500/20 to-blue-500/5", textColor: "text-blue-400" },
    { id: "Ambient", icon: Moon, label: "AMBIENT", color: "from-indigo-500/20 to-indigo-500/5", textColor: "text-indigo-400" },
  ];

  return (
    <AppShell>
      <div className="relative min-h-full w-full bg-background pb-40 overflow-x-hidden">
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_70%_-10%,_rgba(var(--primary-rgb),0.08),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-10 pt-12 md:pt-16">
          {/* Global Search Interface */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
               <div className="flex items-center gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.push('/home')}
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.button>
                  <div className="space-y-1">
                      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter font-space-grotesk italic uppercase">Frequency Search</h1>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Intercepting signals across the network</p>
                  </div>
               </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center">
                <Search className="absolute left-6 text-white/20 group-focus-within:text-primary transition-colors h-6 w-6" />
                <input 
                  type="text"
                  placeholder="What's your current vibration?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-[2rem] py-6 pl-16 pr-16 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-bold text-xl sm:text-2xl text-white placeholder:text-white/10 tracking-tight uppercase italic"
                  autoFocus
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={clearSearch}
                      className="absolute right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all border border-white/5"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Intelligent Content Logic */}
          <div className="min-h-[400px]">
            {!hasSearched && !searchQuery ? (
              /* High-Density Mood Grid */
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-white font-space-grotesk italic">Browse by Resonance</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {moods.map((mood, idx) => {
                    const Icon = mood.icon;
                    return (
                      <motion.div
                        key={mood.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                      >
                        <Link
                          href={`/explore?mood=${mood.id}`}
                          className={`group relative h-48 flex flex-col items-center justify-center rounded-[2rem] p-8 transition-all hover:scale-[1.05] border border-white/5 hover:border-primary/50 bg-gradient-to-br ${mood.color} overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-mesh opacity-0 group-hover:opacity-10 transition-opacity" />
                          <div className={`mb-6 p-4 rounded-2xl bg-white/5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 ${mood.textColor}`}>
                            <Icon className="h-10 w-10" />
                          </div>
                          <div className="font-black text-xs tracking-[0.3em] text-white/60 group-hover:text-white transition-colors italic">{mood.label}</div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* Real-Time Results Matrix */
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                   <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-black uppercase tracking-tight text-white font-space-grotesk italic">Detected Frequencies</h2>
                   </div>
                   {!isLoading && (
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                        {rooms.length} Signals Captured
                      </p>
                   )}
                </div>

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-24"
                    >
                      <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-16 w-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
                      >
                         <Search className="h-8 w-8 text-primary" />
                      </motion.div>
                      <p className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/40 italic animate-pulse">Syncing Database...</p>
                    </motion.div>
                  ) : rooms.length === 0 ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-24 text-center"
                    >
                      <div className="h-20 w-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 mb-8">
                         <Search className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-black text-white/40 uppercase italic font-space-grotesk tracking-tighter mb-2">Signal Lost</h3>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/10">No frequency matching "{searchQuery}"</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid gap-4"
                    >
                      {rooms.map((room, idx) => (
                        <motion.div
                          key={room._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link
                            href={`/room/${room._id}`}
                            className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-primary/40 transition-all group overflow-hidden relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-16 w-16 bg-surface-high rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                              <Radio className="h-8 w-8" />
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-xl font-black text-white tracking-tight truncate font-space-grotesk italic uppercase">{room.name}</h3>
                                <div className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">Live</div>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold">
                                <div className="flex items-center gap-2 text-white/40 uppercase tracking-widest">
                                   <span className="opacity-40 font-black italic">Hosted by</span>
                                   <span className="text-white font-black italic">{room.hostId?.username || "Viber"}</span>
                                </div>
                                <span className="opacity-10 text-white">|</span>
                                <div className="flex items-center gap-2">
                                   <Zap className="h-3.5 w-3.5 text-primary" />
                                   <span className="text-primary font-black uppercase tracking-[0.2em]">{room.mood}</span>
                                </div>
                                <span className="opacity-10 text-white">|</span>
                                <div className="text-white/60 font-black tabular-nums tracking-tighter italic">
                                  {room.listenerCount.toLocaleString()} Vibers active
                                </div>
                              </div>
                            </div>
                            <motion.div 
                              whileHover={{ x: 5 }}
                              className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all"
                            >
                               <ArrowLeft className="h-5 w-5 rotate-180" />
                            </motion.div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
