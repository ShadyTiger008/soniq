"use client";

import { useState } from "react";
import { Crown, Shield, Sparkles, Music, User } from "lucide-react";
import { MemberActionMenu } from "./member-action-menu";
import { motion } from "framer-motion";

interface MemberItemProps {
  id: string;
  name: string;
  role: "admin" | "dj" | "moderator" | "listener" | "guest";
  avatar: string;
  isOnline: boolean;
  djRating?: number;
  isSelf?: boolean;
  currentUserRole?: "admin" | "dj" | "moderator" | "listener";
  onPromoteDJ?: () => void;
  onPromoteModerator?: () => void;
  onDemote?: () => void;
  onKick?: () => void;
}

export function MemberItem({
  id,
  name,
  role,
  avatar,
  isOnline,
  djRating,
  isSelf = false,
  currentUserRole,
  onPromoteDJ,
  onPromoteModerator,
  onDemote,
  onKick,
}: MemberItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Crown };
      case "dj":
        return { color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: Music };
      case "moderator":
        return { color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: Shield };
      default:
        return { color: "text-muted-foreground", bg: "bg-white/5 border-white/5", icon: User };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-surface-high/40 border border-white/5 group hover:border-primary/40 transition-all duration-300 flex items-center justify-between rounded-2xl p-4 relative overflow-hidden shadow-sm",
        isMenuOpen && "ring-1 ring-primary/40 border-primary/40 bg-surface-highest"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex min-w-0 flex-1 items-center gap-4 relative z-10">
        {/* Cinematic Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 flex items-center justify-center overflow-hidden rounded-2xl bg-surface-highest border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
             {avatar && (avatar.startsWith("http") || avatar.length > 2) ? (
               <img src={avatar} alt={name} className="h-full w-full object-cover" />
             ) : (
               <span className="text-lg font-black text-white">{avatar || "🎵"}</span>
             )}
          </div>
          {isOnline && (
            <div className="bg-primary absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-[3px] border-surface-low shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
          )}
        </div>

        {/* Member info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="font-black text-white truncate text-sm tracking-tight">
              {name}
              {isSelf && (
                <span className="ml-2 text-[10px] uppercase tracking-widest text-primary font-black opacity-60">You</span>
              )}
            </p>
            {djRating && djRating >= 4.5 && (
              <Sparkles className="text-primary h-3.5 w-3.5 animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-2">
             <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all", config.bg, config.color)}>
                <Icon className="h-2.5 w-2.5" />
                {role}
             </div>
             {djRating && (
               <span className="text-primary text-[10px] font-bold uppercase tracking-tighter opacity-70">
                 {djRating} SR
               </span>
             )}
          </div>
        </div>
      </div>

      {/* Action menu container */}
      <div className="relative z-20">
          <MemberActionMenu
            userId={id}
            memberName={name}
            currentRole={role}
            isAdmin={currentUserRole === "admin"}
            isModerator={currentUserRole === "admin" || currentUserRole === "moderator"}
            onPromoteDJ={onPromoteDJ}
            onPromoteModerator={onPromoteModerator}
            onDemote={onDemote}
            onKick={onKick}
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
          />
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
