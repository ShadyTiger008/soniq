"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Radio, Globe, Users, Music2 } from "lucide-react";
import { cn } from "@frontend/lib/utils";
import { apiClient } from "@frontend/lib/api-client";

export function Sidebar() {
  const pathname = usePathname();
  const [trendingRooms, setTrendingRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await apiClient.getRooms({ sort: 'trending', limit: 5 });
        if (response.success && response.data) {
          const data = response.data as any;
          setTrendingRooms(data.rooms || data || []);
        }
      } catch (error) {
        console.error("Failed to fetch trending rooms", error);
      }
    };
    fetchTrending();
  }, []);

  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/home",
      active: pathname === "/home",
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
      active: pathname === "/search",
    },
    {
      label: "Live Rooms",
      icon: Radio,
      href: "/explore",
      active: pathname === "/explore",
    },
  ];

  return (
    <div className="flex bg-background h-full w-[280px] flex-col gap-2 p-2">
      <div className="flex flex-col gap-2 bg-card rounded-lg p-6 border border-border/40 shadow-sm">
      <Link href="/home" className="flex h-24 items-center gap-3 px-8 mb-4">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20">
          <Music2 className="text-primary-foreground h-6 w-6" />
        </div>
        <span className="text-foreground text-2xl font-black tracking-tighter">
          SONIQ
        </span>
      </Link>
        <div className="space-y-1">
            {routes.map((route) => (
            <Link
                key={route.label}
                href={route.href}
                className={cn(
                "flex items-center gap-4 px-4 py-3 text-sm font-semibold transition-all rounded-lg group",
                route.active
                    ? "text-primary bg-primary/5 dark:bg-white/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5"
                )}
            >
                <route.icon className={cn("h-5 w-5 transition-colors", route.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {route.label}
            </Link>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-card rounded-lg flex flex-col border border-border/40 shadow-sm">
        <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-2">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <Globe className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span className="font-bold text-sm tracking-wide uppercase">Trending Now</span>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
            {/* Trending Rooms List */}
            <div className="space-y-1 p-2">
                {trendingRooms.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No trending rooms
                  </div>
                ) : (
                  trendingRooms.map((room) => (
                    <Link 
                      key={room._id} 
                      href={`/room/${room._id}`}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-white/5 group transition-all text-left border border-transparent"
                    >
                         <div className="h-10 w-10 bg-muted rounded-lg shrink-0 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                             <Users className="h-5 w-5" />
                         </div>
                         <div className="overflow-hidden flex-1">
                            <p className="font-semibold text-foreground truncate text-sm">{room.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="group-hover:text-foreground transition-colors">{room.listenerCount} listening</span>
                                <span>•</span>
                                <span>{room.mood}</span>
                            </div>
                        </div>
                    </Link>
                  ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
