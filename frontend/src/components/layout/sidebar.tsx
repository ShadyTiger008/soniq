"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Radio, Globe, Users, Music2, History, Library, LogOut, User as UserIcon, LifeBuoy } from "lucide-react";
import { useAuth } from "@frontend/lib/auth-context";
import { cn } from "@frontend/lib/utils";
import { apiClient } from "@frontend/lib/api-client";
import { SupportModal } from "@frontend/components/support-modal";

export function Sidebar() {
  const pathname = usePathname();
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, historyRes] = await Promise.all([
             apiClient.getMyRooms(),
             apiClient.getHistory()
        ]);
        
        if (roomsRes.success && roomsRes.data) {
           setMyRooms(roomsRes.data);
        }
        if (historyRes.success && historyRes.data) {
            setHistory(historyRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data", error);
      }
    };
    fetchData();
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
    <div className="flex bg-background h-full w-[280px] flex-col gap-2 p-2 overflow-hidden">
      {/* Top Section: Logo & Navigation */}
      <div className="flex flex-col gap-6 bg-card rounded-xl p-4 border border-border/40 shadow-sm shrink-0">
        <div className="px-2 pt-2">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Music2 className="text-primary-foreground h-6 w-6" />
            </div>
            <span className="text-foreground text-2xl font-black tracking-tighter uppercase">
              SONIQ
            </span>
          </Link>
        </div>
        
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-sm font-semibold transition-all rounded-lg group",
                route.active
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <route.icon className={cn("h-5 w-5 transition-colors", route.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {route.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Section: Rooms, History & Footer */}
      <div className="flex-1 overflow-hidden bg-card rounded-xl flex flex-col border border-border/40 shadow-sm relative">
         <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col pt-4">
            {/* My Rooms Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-[10px] font-black px-6 mb-2">
                    <Library className="h-3 w-3" />
                    <span>My Rooms</span>
                </div>
                <div className="px-3 space-y-0.5">
                    {myRooms.length === 0 ? (
                        <div className="px-4 text-[11px] text-muted-foreground py-2 italic opacity-60">No rooms created</div>
                    ) : (
                        myRooms.map((room) => (
                            <Link
                                key={room._id}
                                href={`/room/${room._id}`}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted/50 group transition-all"
                            >
                                <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <Radio className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold truncate text-foreground">{room.name}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Listen History Section */}
            <div className="mb-6">
                 <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-[10px] font-black px-6 mb-2">
                    <History className="h-3 w-3" />
                    <span>Listen History</span>
                </div>
                <div className="px-3 space-y-0.5 pb-4">
                    {history.length === 0 ? (
                        <div className="px-4 text-[11px] text-muted-foreground py-2 italic opacity-60">No history</div>
                    ) : (
                        history.map((item) => (
                            <Link
                                key={item._id}
                                href={`/room/${item.room._id}`}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted/50 group transition-all"
                            >
                                <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors overflow-hidden shrink-0">
                                    {item.room.cover ? (
                                        <img src={item.room.cover} alt={item.room.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Music2 className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate text-foreground">{item.room.name}</p>
                                    <p className="text-[9px] text-muted-foreground truncate font-medium">
                                        Last played {new Date(item.lastListened).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
         </div>
         
         {/* Sidebar Footer */}
         <div className="mt-auto shrink-0 p-3 bg-muted/5 border-t border-border/20">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="flex w-full items-center gap-4 px-4 py-3 text-sm font-semibold text-muted-foreground transition-all rounded-lg hover:text-foreground hover:bg-muted/50 group mb-2"
            >
                <LifeBuoy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:rotate-12" />
                Help & Support
            </button>
            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
            
            <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/50 shadow-inner group/user">
                 <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0 border border-primary/20 overflow-hidden">
                     {user?.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-4 w-4" />}
                 </div>
                 <div className="overflow-hidden flex-1 min-w-0">
                     <p className="text-sm font-bold truncate text-foreground">{user?.username || 'Guest'}</p>
                     <Link href="/profile" className="text-[10px] uppercase tracking-tighter font-extrabold text-muted-foreground hover:text-primary transition-colors truncate block">
                        View Profile
                     </Link>
                 </div>
                 <button 
                    onClick={logout}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-300"
                    title="Logout"
                 >
                     <LogOut className="h-4 w-4" />
                 </button>
            </div>
         </div>
      </div>
    </div>
  );
}
