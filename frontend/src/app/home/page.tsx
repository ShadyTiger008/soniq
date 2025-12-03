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

interface Room {
  _id: string;
  name: string;
  hostId?: any;
  listenerCount: number;
  mood: string;
  isPrivate?: boolean;
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
    // Try to join by ID or invite code
    router.push(`/room/${quickJoin.trim()}`);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="from-midnight-black via-deep-navy to-midnight-black flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="border-soft-white h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="from-midnight-black via-deep-navy to-midnight-black text-soft-white min-h-screen bg-gradient-to-b pb-32">
      <div
        className="border-deep-purple/20 sticky top-0 z-20 border-b"
        style={{
          backdropFilter: "blur(10px)",
          background: "rgba(15, 11, 36, 0.8)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="from-ocean-blue to-electric-magenta flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
                <Music className="text-soft-white h-7 w-7" />
              </div>
              <h1 className="from-deep-purple via-electric-magenta to-neon-pink bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
                SONIQ
              </h1>
            </div>
            <Link
              href="/room/create"
              className="from-deep-purple to-electric-magenta text-soft-white flex items-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 font-bold transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: "0 0 20px rgba(108, 43, 217, 0.2)" }}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Create Room</span>
            </Link>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-4 left-4 h-5 w-5" />
            <input
              type="text"
              placeholder="Search rooms, artists, moods..."
              className="border-deep-purple/30 text-soft-white placeholder-muted-foreground focus:border-electric-magenta focus:ring-electric-magenta/50 w-full rounded-xl border py-3 pr-4 pl-12 transition-all duration-300 focus:ring-2 focus:outline-none"
              style={{
                background: "rgba(26, 22, 51, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-16">
          <h2 className="text-soft-white mb-4 flex items-center gap-3 text-xl font-bold">
            <div className="from-ocean-blue to-neon-cyan flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br">
              <Music className="text-midnight-black h-5 w-5" />
            </div>
            Quick Join
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={quickJoin}
              onChange={(e) => setQuickJoin(e.target.value)}
              placeholder="Paste room code or invite link..."
              className="border-deep-purple/30 text-soft-white placeholder-muted-foreground focus:border-electric-magenta flex-1 rounded-xl border px-4 py-3 transition-all duration-300 focus:outline-none"
              style={{
                background: "rgba(26, 22, 51, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            />
            <button
              onClick={handleQuickJoin}
              className="from-deep-purple to-electric-magenta text-soft-white rounded-xl bg-gradient-to-r px-8 py-3 font-bold transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: "0 0 15px rgba(108, 43, 217, 0.2)" }}
            >
              Join
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-soft-white mb-6 flex items-center gap-3 text-xl font-bold">
            <Flame className="text-neon-pink h-5 w-5" />
            Trending Now
          </h2>
          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-soft-white h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : trendingRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No rooms available. Create one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {trendingRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  id={room._id}
                  title={room.name}
                  listeners={room.listenerCount}
                  mood={room.mood}
                  host={typeof room.hostId === "object" ? room.hostId?.username || "Unknown" : "Unknown"}
                  isLive={true}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNowPlaying />
    </div>
  );
}
