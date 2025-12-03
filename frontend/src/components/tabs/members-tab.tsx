"use client";

import { MemberItem } from "../member-item";

interface RoomMember {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface MembersTabProps {
  members?: RoomMember[];
  currentUserId?: string;
  isHost?: boolean;
}

export function MembersTab({
  members = [],
  currentUserId,
  isHost = false,
}: MembersTabProps) {
  // Convert room members to MemberItem format
  const formattedMembers = members.map((member) => {
    const memberId = member._id || member.id || "";
    const isSelf = memberId === currentUserId;
    const isHostMember = isHost && isSelf;

    return {
      id: memberId,
      name: member.username || "Unknown",
      role: (isHostMember ? "dj" : "listener") as
        | "admin"
        | "dj"
        | "moderator"
        | "listener"
        | "guest",
      avatar: member.avatar || "🎵",
      isOnline: true, // All members in room are considered online
      isSelf,
    };
  });

  const currentUserRole = isHost ? "dj" : "listener";

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="font-heading font-700 text-soft-white mb-2 text-lg">
          Room Members ({formattedMembers.length})
        </h3>
        <p className="text-muted-foreground text-sm">
          {formattedMembers.filter((m) => m.isOnline).length} online
        </p>
      </div>

      <div className="space-y-2">
        {formattedMembers.length > 0 ? (
          formattedMembers.map((member) => (
            <MemberItem
              key={member.id}
              {...member}
              currentUserRole={currentUserRole}
              onPromoteDJ={() => console.log(`Promote ${member.name} to DJ`)}
              onPromoteModerator={() =>
                console.log(`Promote ${member.name} to Moderator`)
              }
              onDemote={() => console.log(`Demote ${member.name}`)}
              onKick={() => console.log(`Kick ${member.name}`)}
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
