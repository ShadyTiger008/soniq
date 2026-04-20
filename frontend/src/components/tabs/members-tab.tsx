"use client";

import { MemberItem } from "../member-item";
import { toast } from "sonner";
import type { RoomMember } from "@frontend/types";
import { Users, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface MembersTabProps {
  members?: RoomMember[];
  currentUserId?: string;
  isHost?: boolean;
  onPromoteDJ?: (userId: string) => void;
  onDemote?: (userId: string) => void;
  onKick?: (userId: string) => void;
}

export function MembersTab({
  members = [],
  currentUserId,
  isHost = false,
  onPromoteDJ,
  onDemote,
  onKick,
}: MembersTabProps) {
  const uniqueMembers = Array.from(
    new Map(members.map((m) => [m._id || m.id, m])).values()
  );

  const formattedMembers = uniqueMembers.map((member) => {
    const memberId = member._id || member.id || "";
    const isSelf = memberId === currentUserId;
    
    let role = "listener";
    if (member.role) {
        if (member.role === 'host') role = 'admin';
        else role = member.role;
    } else {
        if (member.isHost || (isHost && isSelf)) role = "admin"; 
    }

    return {
      id: memberId,
      name: member.username || "Unknown",
      role: role as "admin" | "dj" | "moderator" | "listener" | "guest",
      avatar: member.avatar || "🎵",
      isOnline: true, 
      isSelf,
    };
  });

  const currentUserRole = isHost ? "admin" : "listener";

  const handlePromoteDJ = (memberId: string, name: string) => {
      onPromoteDJ?.(memberId);
      toast.success(`Promoted ${name} to DJ`);
  };

  const handleDemote = (memberId: string, name: string) => {
      onDemote?.(memberId);
      toast.success(`Demoted ${name} to Listener`);
  };

  const handleKick = (memberId: string, name: string) => {
      if(confirm(`Are you sure you want to kick ${name}?`)) {
          onKick?.(memberId);
          toast.success(`Kicked ${name}`);
      }
  };

  return (
    <div className="flex h-full flex-col p-6 bg-surface-low/30 overflow-y-auto scrollbar-hide">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-white tracking-widest uppercase">The Audience</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-60">
                <UserCheck className="h-3 w-3" />
                <span>{formattedMembers.filter((m) => m.isOnline).length} Active Now</span>
            </div>
        </div>
        <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Users className="h-5 w-5 text-white/40" />
        </div>
      </div>

      <div className="space-y-3">
        {formattedMembers.length > 0 ? (
          formattedMembers.map((member) => (
            <MemberItem
              key={member.id}
              {...member}
              currentUserRole={currentUserRole}
              onPromoteDJ={() => handlePromoteDJ(member.id, member.name)}
              onDemote={() => handleDemote(member.id, member.name)}
              onKick={() => handleKick(member.id, member.name)}
            />
          ))
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-center opacity-40 py-20">
            <Users className="h-12 w-12 text-primary/40 mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white">Wait for the Crowd</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Members will appear here once they tune in</p>
          </div>
        )}
      </div>
    </div>
  );
}
