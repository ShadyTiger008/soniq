"use client";

import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { QueueSongItem } from "../queue-song-item";
import { RequestSongModal } from "../request-song-modal";

interface Song {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
  requestedBy?: string;
}

interface QueueTabProps {
  queue?: Song[];
  onReorderQueue?: (fromIndex: number, toIndex: number) => void;
  isHost?: boolean;
}

export function QueueTab({
  queue = [],
  onReorderQueue,
  isHost = false,
}: QueueTabProps) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!isHost) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isHost || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isHost || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    e.preventDefault();
    if (onReorderQueue) {
      onReorderQueue(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Queue list */}
      <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
        {queue.length > 0 ? (
          queue.map((song, index) => (
            <div
              key={song.id}
              draggable={isHost}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`smooth-transition relative ${
                draggedIndex === index
                  ? "opacity-50"
                  : dragOverIndex === index
                  ? "translate-x-2"
                  : ""
              } ${isHost ? "cursor-move" : ""}`}
            >
              {isHost && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 text-muted-foreground hover:text-soft-white">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <QueueSongItem
                id={song.id}
                title={song.title}
                artist={song.artist}
                duration={song.duration}
                thumbnail={song.thumbnail}
                requestedBy={song.requestedBy || "Unknown"}
                isDJ={isHost}
              />
            </div>
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
