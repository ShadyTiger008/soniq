"use client";

import { MemberItem } from "../member-item";
import { toast } from "sonner";
import type { RoomMember } from "@frontend/types";

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
  // Convert room members to MemberItem format
  // Filter out duplicates to avoid key collisions
  const uniqueMembers = Array.from(
    new Map(members.map((m) => [m._id || m.id, m])).values()
  );

  const formattedMembers = uniqueMembers.map((member) => {
    const memberId = member._id || member.id || "";
    const isSelf = memberId === currentUserId;
    
    // Determine detailed role
    // Now we rely on the backend provided `role` property (host, dj, listener)
    let role = "listener";
    if (member.role) {
        if (member.role === 'host') role = 'admin';
        else role = member.role;
    } else {
        // Fallback for logic if role missing (older backend)
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
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="font-heading font-700 text-soft-white mb-2 text-lg">
          Room Members ({formattedMembers.length})
        </h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{formattedMembers.filter((m) => m.isOnline).length} Online</span>
            <span>0 Offline</span>
        </div>
      </div>

      <div className="space-y-2">
        {formattedMembers.length > 0 ? (
          formattedMembers.map((member) => (
            <MemberItem
              key={member.id}
              {...member}
              currentUserRole={currentUserRole}
              onPromoteDJ={() => handlePromoteDJ(member.id, member.name)}
              // onPromoteModerator={() => console.log(`Promote ${member.name} to Moderator`)} // Mod not implemented
              onDemote={() => handleDemote(member.id, member.name)}
              onKick={() => handleKick(member.id, member.name)}
            />
          ))
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-2">No members yet</p>
            <p className="text-sm">Members will appear here when they join</p>
          </div>
        )}
      </div>
    </div>
  );
}
