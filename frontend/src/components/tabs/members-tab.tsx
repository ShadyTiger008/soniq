"use client";

import { useState } from "react";
import { MemberItem } from "../member-item";

interface Member {
  id: string;
  name: string;
  role: "admin" | "dj" | "moderator" | "listener" | "guest";
  avatar: string;
  isOnline: boolean;
  djRating?: number;
  isSelf?: boolean;
}

export function MembersTab() {
  const [members] = useState<Member[]>([
    {
      id: "1",
      name: "DJ Mike",
      role: "dj",
      avatar: "🎧",
      isOnline: true,
      djRating: 4.8,
    },
    {
      id: "2",
      name: "You",
      role: "listener",
      avatar: "🎵",
      isOnline: true,
      isSelf: true,
    },
    {
      id: "3",
      name: "Alex",
      role: "listener",
      avatar: "👤",
      isOnline: true,
    },
    {
      id: "4",
      name: "Jordan",
      role: "moderator",
      avatar: "🛡️",
      isOnline: true,
    },
    {
      id: "5",
      name: "Sam",
      role: "listener",
      avatar: "🎶",
      isOnline: false,
    },
  ]);

  const [currentUserRole] = useState<"admin" | "dj" | "moderator" | "listener">(
    "listener",
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="font-heading font-700 text-soft-white mb-2 text-lg">
          Room Members ({members.length})
        </h3>
        <p className="text-muted-foreground text-sm">
          {members.filter((m) => m.isOnline).length} online
        </p>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
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
        ))}
      </div>
    </div>
  );
}

