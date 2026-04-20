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
    <div className="flex bg-background h-full w-[300px] flex-col gap-4 p-4 overflow-hidden border-r border-white/5">
      {/* Brand Section */}
      <div className="px-4 py-4 shrink-0">
          <Link href="/home" className="flex items-center gap-4 group">
            <motion.div 
               whileHover={{ rotate: 10, scale: 1.1 }}
               className="bg-primary flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_0_20px_var(--sonic-glow)]"
            >
              <Music2 className="text-primary-foreground h-7 w-7" />
            </motion.div>
            <span className="text-white text-3xl font-black tracking-tighter uppercase italic">
              SONIQ
            </span>
          </Link>
      </div>

      {/* Primary Navigation */}
      <div className="flex flex-col gap-2 rounded-2xl bg-surface-low p-2 border border-white/5 shadow-inner">
          {routes.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-xl group relative overflow-hidden",
                route.active
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {route.active && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full" 
                />
              )}
              <route.icon className={cn("h-5 w-5 transition-colors", route.active ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
              {route.label}
            </Link>
          ))}
      </div>

      {/* Secondary Content: Rooms & History */}
      <div className="flex-1 overflow-hidden bg-surface-high rounded-3xl flex flex-col border border-white/5 shadow-2xl">
         <div className="flex-1 overflow-y-auto scrollbar-hide py-6">
            {/* Library Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between px-6 mb-4">
                    <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                        <Library className="h-3.5 w-3.5" />
                        <span>Collection</span>
                    </div>
                    <Sparkles className="h-3 w-3 text-primary/40" />
                </div>
                
                <div className="px-3 space-y-1">
                    {myRooms.length === 0 ? (
                        <div className="px-5 text-[11px] text-muted-foreground font-semibold italic opacity-40">Your waves will appear here.</div>
                    ) : (
                        myRooms.map((room) => (
                            <Link
                                key={room._id}
                                href={`/room/${room._id}`}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 group transition-all"
                            >
                                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                    <Radio className="h-5 w-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-black truncate text-white uppercase tracking-tight">{room.name}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Listen History Section */}
            <div>
                 <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-[10px] font-black px-6 mb-4">
                    <History className="h-3.5 w-3.5" />
                    <span>Recent Vibes</span>
                </div>
                <div className="px-3 space-y-1">
                    {history.length === 0 ? (
                        <div className="px-5 text-[11px] text-muted-foreground font-semibold italic opacity-40">No recent activity.</div>
                    ) : (
                        history.map((item) => (
                            <Link
                                key={item._id}
                                href={`/room/${item.room._id}`}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 group transition-all"
                            >
                                <div className="h-10 w-10 bg-surface-low rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-white transition-colors overflow-hidden shrink-0 border border-white/5">
                                    {item.room.cover ? (
                                        <img src={item.room.cover} alt={item.room.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <Music2 className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-black truncate text-white uppercase tracking-tight">{item.room.name}</p>
                                    <p className="text-[9px] text-muted-foreground truncate uppercase font-black tracking-widest mt-0.5">
                                        {new Date(item.lastListened).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
         </div>
         
         {/* Footer: User & Controls */}
         <div className="mt-auto p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="flex w-full items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all rounded-xl hover:text-white hover:bg-white/5 group mb-3 shadow-inner"
            >
                <LifeBuoy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:rotate-12" />
                Concierge
            </button>
            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
            
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-low border border-white/5 shadow-2xl group/user">
                 <div className="h-11 w-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black shrink-0 border border-primary/20 overflow-hidden shadow-inner">
                     {user?.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5" />}
                 </div>
                 <div className="overflow-hidden flex-1 min-w-0">
                     <p className="text-sm font-black truncate text-white tracking-tight">{user?.username || 'GUEST'}</p>
                     <Link href="/profile" className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground hover:text-primary transition-colors truncate block mt-0.5">
                        Elite Status
                     </Link>
                 </div>
                 <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={logout}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-brand-orange hover:text-white text-muted-foreground transition-all duration-300 shadow-xl"
                    title="Sign Out"
                 >
                     <LogOut className="h-4 w-4" />
                 </motion.button>
            </div>
         </div>
      </div>
    </div>
  );
}
