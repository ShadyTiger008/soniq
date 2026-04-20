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
    if (roomId.toUpperCase().startsWith("SONIQ-")) {
      roomId = roomId.substring(6);
    }
    router.push(`/room/${roomId}`);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <motion.div 
           animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
           className="h-10 w-10 rounded-xl bg-primary shadow-[0_0_20px_var(--sonic-glow)] flex items-center justify-center"
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
      <div className="relative min-h-full w-full bg-background p-8 pb-40">
        
        {/* Greetings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
            <h1 className="mb-10 flex items-center gap-4">
                {greeting}, <span className="text-primary tracking-tighter italic">{user?.username || "Viber"}</span>
            </h1>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Premium Create Card */}
                <motion.div 
                   whileHover={{ scale: 1.02, backgroundColor: "var(--surface-highest)" }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => router.push('/room/create')}
                   className="group flex cursor-pointer items-center gap-6 rounded-2xl bg-surface-high p-6 transition-all shadow-xl"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/30 group-hover:rotate-12 transition-transform">
                        <Plus className="h-7 w-7 text-primary-foreground font-black" />
                    </div>
                    <div>
                        <span className="block text-lg font-black text-white uppercase tracking-tight">Create Session</span>
                        <span className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-70">Start the pulse</span>
                    </div>
                </motion.div>

                {/* Quick Join Search Layout */}
                <div className="col-span-1 md:col-span-2 flex items-center gap-4 rounded-2xl bg-surface-low p-4 border border-white/5 shadow-inner focus-within:bg-surface-high transition-colors">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Zap className="h-6 w-6" />
                     </div>
                     <input 
                        type="text"
                        placeholder="Drop a room code..."
                        value={quickJoin}
                        onChange={(e) => setQuickJoin(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickJoin()}
                        className="w-full bg-transparent text-lg font-black text-white placeholder-white/20 focus:outline-none tracking-tight"
                     />
                     <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQuickJoin}
                        className="shrink-0 rounded-xl bg-white px-10 py-3.5 font-black text-black text-xs uppercase tracking-[0.2em] shadow-2xl"
                     >
                        Join
                     </motion.button>
                </div>
            </div>
        </motion.div>

        {/* Trending Section with Staggered Reveal */}
        <section>
            <div className="mb-8 flex items-baseline justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                   <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                   <h2 className="text-2xl font-black uppercase tracking-tight text-white">Trending Vibes</h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Discovery Mode
                </span>
            </div>
            
            {isLoadingRooms ? (
                <div className="flex h-60 items-center justify-center text-muted-foreground font-black uppercase tracking-[0.4em] italic opacity-50">
                   Syncing...
                </div>
            ) : trendingRooms.length === 0 ? (
                <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] p-20 text-center">
                    <Music className="mx-auto h-12 w-12 text-white/10 mb-6" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No active waves. Be the first.</p>
                </div>
            ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.08 } }
                  }}
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                >
                    {trendingRooms.map((room) => (
                         <motion.div 
                           key={room._id}
                           variants={{
                             hidden: { opacity: 0, y: 20 },
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
    </AppShell>
  );
}
