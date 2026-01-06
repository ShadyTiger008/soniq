"use client";

import { useState } from "react";
import { Crown, Shield, Sparkles } from "lucide-react";
import { MemberActionMenu } from "./member-action-menu";

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-neon-pink";
      case "dj":
        return "text-ocean-blue";
      case "moderator":
        return "text-ocean-blue";
      default:
        return "text-muted-foreground";
    }
  };

  const getRoleBgColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-neon-pink/10 border-neon-pink/30";
      case "dj":
        return "bg-ocean-blue/10 border-ocean-blue/30";
      case "moderator":
        return "bg-ocean-blue/10 border-ocean-blue/30 text-ocean-blue";
      default:
        return "bg-primary/10 border-primary/30";
    }
  };

  return (
    <div className={`bg-card border border-border group hover:border-primary/50 smooth-transition flex items-center justify-between rounded-xl p-4 ${isMenuOpen ? 'relative z-50 ring-1 ring-primary/50' : 'relative z-0'}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="from-primary to-electric-magenta flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r text-lg font-bold">
            {avatar.startsWith("http") ? (
              <img
                src={avatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              avatar
            )}
          </div>
          {isOnline && (
            <div className="bg-primary border-background absolute right-0 bottom-0 h-3 w-3 animate-pulse rounded-full border-2" />
          )}
        </div>

        {/* Member info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="font-600 text-foreground truncate text-sm">
              {name}{" "}
              {isSelf && (
                <span className="text-muted-foreground text-xs">(You)</span>
              )}
            </p>

            {/* Role badges */}
            {role === "admin" && (
              <Crown
                className={`h-4 w-4 flex-shrink-0 ${getRoleColor(role)}`}
              />
            )}
            {role === "moderator" && (
              <Shield
                className={`h-4 w-4 flex-shrink-0 ${getRoleColor(role)}`}
              />
            )}

            {/* Special badge */}
            {djRating && djRating >= 4.5 && (
              <Sparkles className="text-neon-pink h-4 w-4 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${getRoleBgColor(role)} ${getRoleColor(role)}`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>

            {djRating && (
              <span className="text-ocean-blue text-xs">
                DJ Rating: {djRating}/5.0
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action menu */}
      <MemberActionMenu
        userId={id}
        memberName={name}
        currentRole={role}
        isAdmin={currentUserRole === "admin"}
        isModerator={
          currentUserRole === "admin" || currentUserRole === "moderator"
        }
        onPromoteDJ={onPromoteDJ}
        onPromoteModerator={onPromoteModerator}
        onDemote={onDemote}
        onKick={onKick}
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      />
    </div>
  );
}
