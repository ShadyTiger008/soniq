"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { QueueSongItem } from "../queue-song-item";
import { RequestSongModal } from "../request-song-modal";

interface Song {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
}

interface QueueTabProps {
  queue?: Song[];
}

export function QueueTab({ queue = [] }: QueueTabProps) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  return (
    <div className="flex h-full flex-col p-4">
      {/* Queue list */}
      <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
        {queue.length > 0 ? (
          queue.map((song, index) => (
            <QueueSongItem
              key={song.id}
              id={song.id}
              title={song.title}
              artist={song.artist}
              duration={song.duration}
              thumbnail={song.thumbnail}
              requestedBy="User"
              isDJ={true}
            />
          ))
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-2">No songs in queue</p>
            <p className="text-sm">Request a song to add it to the queue</p>
          </div>
        )}
      </div>

      {/* Request song button */}
      <button
        onClick={() => setIsRequestModalOpen(true)}
        className="hover:border-electric-magenta text-muted-foreground hover:text-electric-magenta smooth-transition font-600 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[rgba(108,43,217,0.3)] p-3 text-sm"
      >
        <Plus className="h-4 w-4" />
        Request a Song
      </button>

      {/* Request song modal */}
      <RequestSongModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
