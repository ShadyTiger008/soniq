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

      <div className="flex-1 overflow-hidden bg-card rounded-lg flex flex-col border border-border/40 shadow-sm mt-2">
         {/* My Rooms Section */}
         <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            <div className="p-4 pb-2 sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold px-2">
                    <Library className="h-3 w-3" />
                    <span>My Rooms</span>
                </div>
            </div>
            <div className="px-2 pb-4 space-y-1">
                {myRooms.length === 0 ? (
                    <div className="px-4 text-xs text-muted-foreground py-2 italic">No rooms created</div>
                ) : (
                    myRooms.map((room) => (
                        <Link
                            key={room._id}
                            href={`/room/${room._id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group transition-all"
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

            {/* Listen History Section */}
             <div className="p-4 pb-2 sticky top-0 bg-card z-10 border-t border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs font-bold px-2">
                    <History className="h-3 w-3" />
                    <span>Listen History</span>
                </div>
            </div>
            <div className="px-2 pb-4 space-y-1">
                 {history.length === 0 ? (
                    <div className="px-4 text-xs text-muted-foreground py-2 italic">No listening history</div>
                ) : (
                    history.map((item) => (
                        <Link
                            key={item._id}
                            href={`/room/${item.room._id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group transition-all opacity-80 hover:opacity-100"
                        >
                            <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors overflow-hidden">
                                {item.room.cover ? (
                                    <img src={item.room.cover} alt={item.room.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Music2 className="h-4 w-4" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate text-foreground">{item.room.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    Last played {new Date(item.lastListened).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
         </div>
         
         {/* Help & Support */}
         <div className="px-3 pb-2">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="flex w-full items-center gap-4 px-4 py-3 text-sm font-semibold text-muted-foreground transition-all rounded-lg hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 group"
            >
                <LifeBuoy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors hover:rotate-12" />
                Help & Support
            </button>
         </div>

         {/* User Footer */}
         <div className="p-3 mt-auto border-t border-border/40 bg-muted/20">
            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50 shadow-sm">
                 <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                     {user?.avatar ? <img src={user.avatar} className="h-full w-full rounded-full object-cover" /> : <UserIcon className="h-4 w-4" />}
                 </div>
                 <div className="overflow-hidden flex-1 min-w-0">
                     <p className="text-sm font-bold truncate">{user?.username || 'Guest'}</p>
                     <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block">
                        View Profile
                     </Link>
                 </div>
                 <button 
                    onClick={logout}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
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
