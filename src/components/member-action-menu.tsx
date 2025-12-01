"use client";

import { useState } from "react";
import { MoreVertical, Crown, Shield, User, UserX } from "lucide-react";

interface MemberActionMenuProps {
  userId: string;
  memberName: string;
  currentRole: "admin" | "dj" | "moderator" | "listener";
  isAdmin: boolean;
  isModerator: boolean;
  onPromoteDJ?: () => void;
  onPromoteModerator?: () => void;
  onDemote?: () => void;
  onKick?: () => void;
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
}: MemberActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const canModerate = isAdmin || isModerator;
  const canPromote = isAdmin;

  if (!canModerate) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="smooth-transition text-muted-foreground hover:text-soft-white rounded-lg p-2 opacity-0 group-hover:opacity-100 hover:bg-[rgba(108,43,217,0.2)]"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="glass-card shadow-deep-purple/20 absolute top-full right-0 z-20 mt-2 min-w-48 overflow-hidden rounded-lg shadow-lg">
          {canPromote && (
            <>
              {currentRole !== "dj" && (
                <button
                  onClick={() => {
                    onPromoteDJ?.();
                    setIsOpen(false);
                  }}
                  className="text-soft-white smooth-transition flex w-full items-center gap-2 border-b border-[rgba(108,43,217,0.2)] px-4 py-3 text-left hover:bg-[rgba(108,43,217,0.2)]"
                >
                  <Crown className="text-ocean-blue h-4 w-4" />
                  Make DJ
                </button>
              )}

              {currentRole !== "moderator" && (
                <button
                  onClick={() => {
                    onPromoteModerator?.();
                    setIsOpen(false);
                  }}
                  className="text-soft-white smooth-transition flex w-full items-center gap-2 border-b border-[rgba(108,43,217,0.2)] px-4 py-3 text-left hover:bg-[rgba(108,43,217,0.2)]"
                >
                  <Shield className="text-neon-cyan h-4 w-4" />
                  Make Moderator
                </button>
              )}

              {(currentRole === "dj" || currentRole === "moderator") && (
                <button
                  onClick={() => {
                    onDemote?.();
                    setIsOpen(false);
                  }}
                  className="text-soft-white smooth-transition flex w-full items-center gap-2 border-b border-[rgba(108,43,217,0.2)] px-4 py-3 text-left hover:bg-[rgba(108,43,217,0.2)]"
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
                setIsOpen(false);
              }}
              className="text-destructive hover:bg-destructive/10 smooth-transition flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <UserX className="h-4 w-4" />
              Kick User
            </button>
          )}
        </div>
      )}
    </div>
  );
}
