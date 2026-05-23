"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Radio, Globe, Users, Music2, History, Library, LogOut, User as UserIcon, LifeBuoy, Sparkles } from "lucide-react";
import { useAuth } from "@frontend/lib/auth-context";
import { cn } from "@frontend/lib/utils";
import { apiClient } from "@frontend/lib/api-client";
import { SupportModal } from "@frontend/components/support-modal";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@frontend/components/ui/scroll-area";
import { Button } from "@frontend/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (!user || user.isGuest) {
      setMyRooms([]);
      setHistory([]);
      return;
    }
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
  }, [user]);

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
    <div className="flex bg-black h-full w-[260px] flex-col gap-2 p-2 overflow-hidden border-r border-white/5 shadow-[20px_0_100px_rgba(0,0,0,0.8)]">
      {/* Brand Section */}
      <div className="px-3 py-1 shrink-0">
          <Link href="/home" className="flex items-center gap-3 group">
            <motion.div 
               whileHover={{ rotate: 10, scale: 1.1 }}
               className="bg-primary flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_0_20px_var(--vibecue-glow)]"
            >
              <Music2 className="text-primary-foreground h-3.5 w-3.5" />
            </motion.div>
            <span className="text-white text-lg font-black tracking-tighter uppercase italic font-space-grotesk">
              Vibecue
            </span>
          </Link>
      </div>

      {/* Primary Navigation */}
      <div className="flex flex-col gap-1 rounded-xl bg-surface-low p-1.5 border border-white/5">
          {routes.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-lg group relative overflow-hidden",
                route.active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {route.active && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-primary rounded-full" 
                />
              )}
              <route.icon className={cn("h-4 w-4 transition-colors", route.active ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
              {route.label}
            </Link>
          ))}
      </div>

      {/* Secondary Content: Rooms & History */}
      <ScrollArea className="flex-1 bg-surface-high rounded-xl border border-white/5 shadow-2xl overflow-hidden mt-1">
         <div className="py-4 px-1.5">
            {/* Library Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between px-4 mb-3">
                    <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-[9px] font-black opacity-60">
                        <Library className="h-3 w-3" />
                        <span>Collection</span>
                    </div>
                    <Sparkles className="h-2.5 w-2.5 text-primary/20" />
                </div>
                
                <div className="px-1.5 space-y-1">
                    {myRooms.length === 0 ? (
                        <div className="px-4 py-3 text-[10px] text-muted-foreground font-semibold italic opacity-20 bg-white/[0.01] rounded-lg">Empty vibes...</div>
                    ) : (
                        myRooms.map((room) => (
                            <Link
                                key={room._id}
                                href={`/room/${room._id}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group transition-all"
                            >
                                <div className="h-8 w-8 bg-white/5 rounded-lg flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                    <Radio className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[12px] font-bold truncate text-white uppercase tracking-tight font-space-grotesk">{room.name}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Listen History Section */}
            <div>
                 <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-[9px] font-black px-4 mb-3 opacity-60">
                    <History className="h-3 w-3" />
                    <span>Recents</span>
                </div>
                <div className="px-1.5 space-y-1">
                    {history.length === 0 ? (
                        <div className="px-4 py-3 text-[10px] text-muted-foreground font-semibold italic opacity-20 bg-white/[0.01] rounded-lg">Nothing yet.</div>
                    ) : (
                        history.map((item) => (
                            <Link
                                key={item._id}
                                href={`/room/${item.room._id}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group transition-all"
                            >
                                <div className="h-8 w-8 bg-surface-low rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-white transition-colors overflow-hidden shrink-0 border border-white/5">
                                    {item.room.cover ? (
                                        <img src={item.room.cover} alt={item.room.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <Music2 className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[12px] font-bold truncate text-white uppercase tracking-tight font-space-grotesk">{item.room.name}</p>
                                    <p className="text-[8px] text-muted-foreground truncate uppercase font-black tracking-widest mt-0.5">
                                        {new Date(item.lastListened).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
         </div>
      </ScrollArea>

      <div className="mt-auto flex flex-col gap-2">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-all rounded-xl hover:text-white hover:bg-white/5 group border border-white/[0.03]"
            >
                <LifeBuoy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:rotate-12" />
                Concierge
            </button>
            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
            
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-surface-low border border-white/5 shadow-2xl group/user">
                 <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black shrink-0 border border-primary/10 overflow-hidden shadow-inner">
                     {user?.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-4 w-4" />}
                 </div>
                 <div className="overflow-hidden flex-1 min-w-0">
                     <p className="text-[11px] font-bold truncate text-white tracking-tight leading-none mb-1">{user?.isGuest ? (user?.username || 'Guest') : (user?.username || 'GUEST')}</p>
                     <p className="text-[8px] uppercase tracking-[0.1em] font-black text-primary opacity-40 truncate">
                        {user?.isGuest ? 'Guest Session' : (user?.email || 'Elite Status')}
                     </p>
                 </div>
                 <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={logout}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-orange hover:text-white text-muted-foreground transition-all duration-300"
                    title="Sign Out"
                 >
                     <LogOut className="h-4 w-4" />
                 </motion.button>
            </div>
      </div>
    </div>
  );
}
