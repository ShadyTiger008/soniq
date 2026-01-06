"use client";

import { useState, useEffect } from "react";
import { Search, Headphones, Moon, Heart, PartyPopper, Coffee, Users, Music2, Music } from "lucide-react";
import { RoomCard } from "@frontend/components/room-card";
import { BottomNowPlaying } from "@frontend/components/bottom-now-playing";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import type { Room } from "@frontend/types";

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Featured", "Trending", "Lofi", "Study", "Party", "Chill", "Romance", "Gaming"];

  useEffect(() => {
    fetchRooms();
  }, [selectedMood, searchQuery]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getRooms({
        limit: 50,
        mood: selectedMood || undefined,
        search: searchQuery || undefined,
      });
      if (response.success && response.data) {
        const data = response.data as any;
        setRooms(data.rooms || data || []);
      } else {
        toast.error(response.error || "Failed to load rooms");
      }
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const liveNowRooms = rooms.slice(0, 3).map((room) => ({
    id: room._id,
    title: room.name,
    host: typeof room.hostId === "object" ? room.hostId?.username || "Unknown" : "Unknown",
    listeners: room.listenerCount,
    thumbnail: room.cover,
    mood: room.mood,
  }));

  const trendingRooms = rooms.slice(3, 6).map((room) => ({
    id: room._id,
    title: room.name,
    host: typeof room.hostId === "object" ? room.hostId?.username || "Unknown" : "Unknown",
    listeners: room.listenerCount,
    avatars: ["👤", "🎧", "🎵", "🎶"],
    mood: room.mood,
    timeAgo: "Recently",
    cover: room.cover,
  }));

  const moods = [
    { id: "Focus", icon: Headphones, label: "Focus" },
    { id: "Sleep", icon: Moon, label: "Sleep", emoji: "😴" },
    { id: "Study", icon: Heart, label: "Study" },
    { id: "Party", icon: PartyPopper, label: "Party" },
    { id: "Chill", icon: Coffee, label: "Chill", emoji: "😎" },
    { id: "Romance", icon: Coffee, label: "Romance" },
    { id: "Coffee", icon: Coffee, label: "Coffee" },
  ];

  const newRooms = rooms.slice(6, 9).map((room) => ({
    id: room._id,
    title: room.name,
    listeners: room.listenerCount,
    cover: room.cover,
  }));

  return (
    <div className="bg-background text-foreground min-h-screen pb-32">
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8">
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-border p-8 text-center bg-card shadow-sm">
          <h1 className="mb-3 text-5xl font-bold text-foreground tracking-tight">Explore Rooms</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Join live music rooms, discover trending vibes, and connect with people listening right now.
          </p>
          
          {/* Main Search Bar */}
          <div className="relative max-w-xl mx-auto">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
             <input 
                type="text"
                placeholder="Search for rooms, vibes, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground shadow-inner"
             />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`smooth-transition whitespace-nowrap rounded-xl px-6 py-3 font-semibold text-sm ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Live Now Rooms */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-2xl">🔥</span>
            Live Now
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : liveNowRooms.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
              No rooms available
            </div>
          ) : (
            liveNowRooms.map((room) => (
            <div
              key={room.id}
              className="bg-card group relative overflow-hidden rounded-2xl block border border-border shadow-sm hover:shadow-md transition-all"
            >
              {/* Room Image */}
              <div className="from-primary/10 to-primary/5 relative aspect-[4/3] overflow-hidden bg-gradient-to-br">
                {room.thumbnail ? (
                   <img src={room.thumbnail} alt={room.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music2 className="text-primary/20 h-24 w-24" />
                    </div>
                )}
                {/* Live Now Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 backdrop-blur-sm shadow-sm">
                  <div className="bg-white h-2 w-2 animate-pulse rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">Live Now 🔥</span>
                </div>
                {/* Join Button Overlay */}
                <div className="from-background/90 dark:from-black/90 smooth-transition absolute inset-0 flex items-center justify-center bg-gradient-to-t to-transparent opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                  <Link
                    href={`/room/${room.id}`}
                    className="bg-primary text-primary-foreground w-max rounded-xl px-8 py-3 font-bold transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
                  >
                    Join Room
                  </Link>
                </div>
              </div>
              {/* Room Info */}
              <div className="p-5">
                <h3 className="font-bold text-foreground mb-1 text-lg tracking-tight">
                  {room.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm font-medium">By {room.host}</p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                    <Users className="h-4 w-4 text-primary" />
                    {room.listeners.toLocaleString()} listening
                  </span>
                  <span className="text-primary border-primary/20 rounded-full border bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {room.mood}
                  </span>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Trending Rooms */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-2xl">🔥</span>
            Trending Rooms
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : trendingRooms.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
              No trending rooms available
            </div>
          ) : (
            trendingRooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className="bg-card hover:bg-muted/50 border border-border shadow-sm smooth-transition group rounded-xl p-5 block"
              >
              <div className="mb-4 flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {(room as any).cover ? (
                        <img src={(room as any).cover} alt={room.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                             <Music className="h-6 w-6" />
                        </div>
                    )}
                 </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1 text-base tracking-tight truncate">
                    {room.title}
                  </h3>
                  <p className="text-muted-foreground text-xs font-medium">By {room.host}</p>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2">
                {room.avatars?.map((avatar, idx) => (
                  <div
                    key={idx}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-xs shadow-sm"
                  >
                    {avatar}
                  </div>
                ))}
                {/* Waveform Visualizer */}
                <div className="ml-auto flex h-8 items-end gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-primary/40 w-1 rounded-full group-hover:bg-primary transition-colors"
                      style={{
                        height: `${10 + i * 2}px`,
                        animation: `waveform ${0.5 + i * 0.1}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  {room.listeners.toLocaleString()} listening
                </span>
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{room.timeAgo}</span>
              </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Rooms by Mood */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-2xl">🍃</span>
            Rooms by Mood
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`smooth-transition flex min-w-[120px] flex-col items-center gap-3 rounded-2xl p-6 border transition-all ${
                  selectedMood === mood.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border shadow-sm"
                }`}
              >
                {mood.emoji ? (
                  <span className="text-3xl filter drop-shadow-sm">{mood.emoji}</span>
                ) : (
                  <Icon className={`h-8 w-8 ${selectedMood === mood.id ? 'text-primary-foreground' : 'text-primary'}`} />
                )}
                <span className="font-bold text-xs uppercase tracking-widest">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New & Rising Rooms */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-2xl">✨</span>
            New & Rising Rooms
          </h2>
        </div>
        <div className="space-y-3">
          {newRooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className="bg-card hover:bg-muted border border-border shadow-sm smooth-transition group flex items-center justify-between rounded-2xl p-5"
            >
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary border border-border overflow-hidden shrink-0">
                    {(room as any).cover ? (
                         <img src={(room as any).cover} alt={room.title} className="h-full w-full object-cover" />
                    ) : (
                        <Music className="h-5 w-5" />
                    )}
                 </div>
                 <div>
                    <h3 className="font-bold text-foreground mb-0.5 text-base tracking-tight">
                      {room.title}
                    </h3>
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {room.listeners.toLocaleString()} listeners
                    </p>
                 </div>
              </div>
              <button className="bg-primary text-primary-foreground smooth-transition rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest shadow-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                Join
              </button>
            </Link>
          ))}
        </div>
      </div>

      <BottomNowPlaying />
    </div>
  );
}
