"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Flame, Heart, Music } from "lucide-react";
import { RoomCard } from "@frontend/components/room-card";
import { BottomNowPlaying } from "@frontend/components/bottom-now-playing";
import { useAuth } from "@frontend/lib/auth-context";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import { AppShell } from "@frontend/components/layout/app-shell";

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
    
    // Strip the "SONIQ-" prefix if it exists
    let roomId = quickJoin.trim();
    if (roomId.toUpperCase().startsWith("SONIQ-")) {
      roomId = roomId.substring(6);
    }
    
    router.push(`/room/${roomId}`);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      {/* Home Content Container */}
      <div className="relative min-h-full w-full bg-background p-6 pb-32">
        
        {/* Top Header / Search */}
        <div className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              {/* Optional: Navigation Arrows could go here */}
           </div>
           <div className="relative w-full max-w-md hidden md:block">
           </div>
        </div>

        {/* Hero / Greeting Section */}
        <div className="mb-10">
            <h1 className="mb-8 text-4xl font-black text-foreground tracking-tight">
                {greeting}, <span className="text-primary">{user?.username || "there"}</span>
            </h1>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Create Room Card */}
                <div 
                   onClick={() => router.push('/room/create')}
                   className="group flex cursor-pointer items-center gap-5 rounded-2xl bg-card p-5 transition-all hover:bg-muted border border-border/50 shadow-sm hover:shadow-md"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg group-hover:scale-105 transition-transform">
                        <Plus className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <span className="block font-bold text-foreground">Create New Room</span>
                        <span className="text-xs text-muted-foreground font-medium">Start your own session</span>
                    </div>
                </div>

                {/* Quick Join Card (Input) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 flex items-center gap-3 rounded-2xl bg-card p-4 transition-all focus-within:ring-2 focus-within:ring-primary/20 border border-border/50 shadow-sm">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Search className="h-6 w-6" />
                     </div>
                     <input 
                        type="text"
                        placeholder="Enter room code to join..."
                        value={quickJoin}
                        onChange={(e) => setQuickJoin(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickJoin()}
                        className="w-full bg-transparent text-lg font-bold text-foreground placeholder-muted-foreground focus:outline-none"
                     />
                     <button 
                        onClick={handleQuickJoin}
                        className="shrink-0 rounded-xl bg-primary px-8 py-3 font-black text-primary-foreground text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-primary/20"
                     >
                        Join
                     </button>
                </div>
            </div>
        </div>

        {/* Trending Section */}
        <section>
            <div className="mb-6 flex items-end justify-between">
                <h2 className="text-2xl font-black text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer">
                    Trending Rooms
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Show All
                </span>
            </div>
            
            {isLoadingRooms ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground font-bold italic tracking-widest">
                   Loading vibes...
                </div>
            ) : trendingRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground font-medium">
                    No public rooms active right now. Start the party!
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {trendingRooms.map((room) => (
                         <RoomCard
                            key={room._id}
                            id={room._id}
                            title={room.name}
                            listeners={room.listenerCount}
                            mood={room.mood}
                            host={typeof room.hostId === "object" ? room.hostId?.username || "Unknown" : "Unknown"}
                            thumbnail={room.cover}
                            isLive={true} 
                         />
                    ))}
                </div>
            )}
        </section>
      </div>
    </AppShell>
  );
}
