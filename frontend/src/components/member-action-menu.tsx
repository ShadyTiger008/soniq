"use client";

import { useState } from "react";
import { MoreVertical, Crown, Shield, User, UserX } from "lucide-react";

interface MemberActionMenuProps {
  userId: string;
  memberName: string;
  currentRole: "admin" | "dj" | "moderator" | "listener" | "guest";
  isAdmin: boolean;
  isModerator: boolean;
  onPromoteDJ?: () => void;
  onPromoteModerator?: () => void;
  onDemote?: () => void;
  onKick?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberActionMenu({
  userId,
  memberName,
  currentRole,
  isAdmin,
  isModerator,
  onPromoteDJ,
  onPromoteModerator,
  onDemote,
  onKick,
  isOpen,
  onOpenChange,
}: MemberActionMenuProps) {

  const canModerate = isAdmin || isModerator;
  const canPromote = isAdmin;

  if (!canModerate) return null;

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!isOpen)}
        className={`smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)] ${
          isOpen 
            ? "text-soft-white opacity-100 bg-[rgba(108,43,217,0.2)]" 
            : "text-muted-foreground hover:text-soft-white opacity-0 group-hover:opacity-100"
        }`}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
        <div 
            className="fixed inset-0 z-10" 
            onClick={() => onOpenChange(false)} 
        />
        <div className="absolute top-full right-0 z-20 mt-2 min-w-48 overflow-hidden rounded-lg shadow-2xl border border-border/20 bg-[#121212] ring-1 ring-white/10">
          {canPromote && (
            <>
              {currentRole !== "dj" && (
                <button
                  onClick={() => {
                    onPromoteDJ?.();
                    onOpenChange(false);
                  }}
                  className="text-soft-white smooth-transition flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left hover:bg-white/5 text-sm font-medium"
                >
                  <Crown className="text-ocean-blue h-4 w-4" />
                  Make DJ
                </button>
              )}

              {currentRole !== "moderator" && (
                <button
                  onClick={() => {
                    onPromoteModerator?.();
                    onOpenChange(false);
                  }}
                  className="text-soft-white smooth-transition flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left hover:bg-white/5 text-sm font-medium"
                >
                  <Shield className="text-neon-cyan h-4 w-4" />
                  Make Moderator
                </button>
              )}

              {(currentRole === "dj" || currentRole === "moderator") && (
                <button
                  onClick={() => {
                    onDemote?.();
                    onOpenChange(false);
                  }}
                  className="text-soft-white smooth-transition flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left hover:bg-white/5 text-sm font-medium"
                >
                  <User className="text-muted-foreground h-4 w-4" />
                  Remove Role
                </button>
              )}
            </>
          )}

          {canModerate && (
            <button
              onClick={() => {
                onKick?.();
                onOpenChange(false);
              }}
              className="text-red-400 hover:bg-red-500/10 smooth-transition flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium"
            >
              <UserX className="h-4 w-4" />
              Kick User
            </button>
          )}
        </div>
        </>
      )}
    </div>
  );
}
