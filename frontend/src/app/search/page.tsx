"use client";

import { useState, useEffect } from "react";
import { Search, Headphones, Moon, Heart, PartyPopper, Coffee, Music2, X } from "lucide-react";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import { useDebounce } from "@uidotdev/usehooks";

interface Room {
  _id: string;
  name: string;
  hostId?: any;
  listenerCount: number;
  mood: string;
  currentSong?: any;
}

export default function SearchPage() {
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
    { id: "Focus", icon: Headphones, label: "Focus", color: "bg-blue-500/10 text-blue-500" },
    { id: "Sleep", icon: Moon, label: "Sleep", color: "bg-indigo-500/10 text-indigo-500" },
    { id: "Study", icon: Heart, label: "Study", color: "bg-rose-500/10 text-rose-500" },
    { id: "Party", icon: PartyPopper, label: "Party", color: "bg-amber-500/10 text-amber-500" },
    { id: "Chill", icon: Coffee, label: "Chill", color: "bg-emerald-500/10 text-emerald-500" },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Search</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-5 w-5" />
            <input 
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card hover:bg-muted/50 border border-border rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg shadow-sm"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {!hasSearched && !searchQuery ? (
          /* Browse Moods */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Browse by Mood</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <Link
                    key={mood.id}
                    href={`/explore?mood=${mood.id}`}
                    className={`group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-[1.02] border border-border/50 hover:border-border bg-card hover:bg-muted/30`}
                  >
                    <div className={`mb-3 inline-flex rounded-lg p-2.5 ${mood.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-bold text-base">{mood.label}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-4">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                 <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
                 <p>Searching...</p>
               </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                 <div className="bg-muted/50 rounded-full p-4 mb-4">
                    <Search className="h-8 w-8 opacity-50" />
                 </div>
                 <p className="text-lg font-medium">No results found for "{searchQuery}"</p>
                 <p className="text-sm opacity-70">Try searching for a different room or mood</p>
              </div>
            ) : (
              <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-sm font-semibold text-muted-foreground mb-1">
                  Found {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                </h2>
                {rooms.map((room) => (
                  <Link
                    key={room._id}
                    href={`/room/${room._id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 border border-border transition-all group"
                  >
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Music2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate pr-4">{room.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">{room.hostId?.username || "Unknown"}</span>
                        <span>•</span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{room.mood}</span>
                        <span>•</span>
                        <span>{room.listenerCount} listening</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
