"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Sparkles, Zap, Radio, Music } from "lucide-react";
import { RoomCard } from "@frontend/components/room-card";
import { useAuth } from "@frontend/lib/auth-context";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import { AppShell } from "@frontend/components/layout/app-shell";
import { motion } from "framer-motion";

interface Room {
  _id: string;
  name: string;
  hostId?: any;
  listenerCount: number;
  mood: string;
  isPrivate?: boolean;
  cover?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [quickJoin, setQuickJoin] = useState("");
  const [trendingRooms, setTrendingRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/home");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTrendingRooms();
    }
  }, [isAuthenticated]);

  const fetchTrendingRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const response = await apiClient.getRooms({ limit: 20 });
      if (response.success && response.data) {
        const data = response.data as any;
        setTrendingRooms(data.rooms || data || []);
      }
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleQuickJoin = async () => {
    if (!quickJoin.trim()) {
      toast.error("Please enter a room code or ID");
      return;
    }
    let roomId = quickJoin.trim();
    if (roomId.toUpperCase().startsWith("VIBECUE-")) {
      roomId = roomId.substring(8);
    }
    router.push(`/room/${roomId}`);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <motion.div 
           animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
           className="h-10 w-10 rounded-xl bg-primary shadow-[0_0_20px_var(--vibecue-glow)] flex items-center justify-center"
         >
            <Radio className="text-primary-foreground h-6 w-6" />
         </motion.div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <div className="relative min-h-full w-full bg-background pb-40 overflow-x-hidden">
        
        {/* Dynamic Spotify-Style Hero Banner */}
        {!isLoadingRooms && trendingRooms.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-[380px] group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(var(--primary-rgb),0.15),transparent_50%)] z-0" />
            <div className="absolute inset-0 bg-mesh opacity-20 mix-blend-overlay z-0" />

            <div className="relative h-full max-w-[1600px] mx-auto px-6 sm:px-8 flex flex-col justify-center z-10">
              <div className="flex items-center gap-2 mb-6">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-primary text-[11px] font-black uppercase tracking-[0.3em] italic">Featured Live Session</span>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 lg:gap-12">
                 <motion.div 
                   whileHover={{ scale: 1.05, rotate: -2 }}
                   onClick={() => router.push(`/room/${trendingRooms[0]?._id}`)}
                   className="h-40 w-40 sm:h-48 sm:w-48 shrink-0 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 cursor-pointer group/img"
                 >
                    {trendingRooms[0]?.cover ? (
                      <img src={trendingRooms[0].cover} className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-surface-high to-surface-low flex items-center justify-center">
                        <Music className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                 </motion.div>

                 <div className="flex-1 space-y-4 md:space-y-6">
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter font-space-grotesk italic uppercase leading-[0.9]"
                    >
                      {trendingRooms[0]?.name}
                    </motion.h1>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                       <div className="flex items-center gap-2 text-white font-bold">
                          <Radio className="h-4 w-4 text-primary" />
                          <span className="text-sm sm:text-base tracking-tight">{trendingRooms[0]?.listenerCount.toLocaleString()} <span className="opacity-40 uppercase text-[10px] sm:text-[11px] ml-1">Vibers Active</span></span>
                       </div>
                       <div className="flex items-center gap-2 text-white/40 uppercase tracking-[0.2em] text-[10px] sm:text-[11px] font-black">
                          <Sparkles className="h-4 w-4 text-primary/40" />
                          <span>Mood: {trendingRooms[0]?.mood}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                       <motion.button 
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => router.push(`/room/${trendingRooms[0]?._id}`)}
                         className="px-8 sm:px-12 py-3 sm:py-4 bg-primary text-white font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/50 transition-all"
                       >
                          Dive In Now
                       </motion.button>
                       <button className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all">
                          <Plus className="h-5 w-5" />
                       </button>
                    </div>
                 </div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
          </motion.div>
        )}

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 mt-12"
          >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="space-y-2">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter font-space-grotesk italic uppercase">
                        {greeting}, <span className="text-primary">{user?.username || "Viber"}</span>
                      </h2>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Welcome back to the sync</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/room/create')}
                        className="flex items-center justify-center sm:justify-start gap-4 px-8 py-3 bg-surface-high hover:bg-surface-highest rounded-xl border border-white/5 transition-all group"
                      >
                          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform">
                             <Plus className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Create Room</span>
                      </motion.button>

                      <div className="flex items-center gap-3 bg-surface-low p-2 rounded-xl border border-white/5 focus-within:bg-surface-high transition-all">
                          <input 
                            type="text"
                            placeholder="Enter Code..."
                            value={quickJoin}
                            onChange={(e) => setQuickJoin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickJoin()}
                            className="bg-transparent text-[11px] font-black text-white px-3 w-full sm:w-32 focus:outline-none placeholder:text-white/10 uppercase tracking-widest"
                          />
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleQuickJoin}
                            className="bg-white text-black px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
                          >
                            Join
                          </motion.button>
                      </div>
                  </div>
              </div>
          </motion.div>

          <section>
              <div className="mb-10 flex items-end justify-between border-b border-white/[0.03] pb-8">
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-space-grotesk italic">Trending Vibes</h2>
                     </div>
                     <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white/20">The most active frequencies right now</p>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 hover:text-primary transition-colors border-b border-transparent hover:border-primary/20 pb-2">
                      View All
                  </button>
              </div>
              
              {isLoadingRooms ? (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-surface-low rounded-3xl animate-pulse border border-white/5" />
                      ))}
                  </div>
              ) : trendingRooms.length === 0 ? (
                  <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] py-32 text-center">
                      <Music className="mx-auto h-12 w-12 text-white/5 mb-6" />
                      <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Silence detected. Create a wave.</p>
                  </div>
              ) : (
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05 } }
                    }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  >
                      {trendingRooms.map((room) => (
                           <motion.div 
                             key={room._id}
                             variants={{
                               hidden: { opacity: 0, y: 15 },
                               visible: { opacity: 1, y: 0 }
                             }}
                           >
                             <RoomCard
                                id={room._id}
                                title={room.name}
                                listeners={room.listenerCount}
                                mood={room.mood}
                                host={typeof room.hostId === "object" ? room.hostId?.username || "Anon" : "Anon"}
                                thumbnail={room.cover}
                                isLive={true} 
                             />
                           </motion.div>
                      ))}
                  </motion.div>
              )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
