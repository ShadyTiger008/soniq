"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { QueueSongItem } from "../queue-song-item";

import type { Song } from "@frontend/types";

interface QueueTabProps {
  queue?: Song[];
  onReorderQueue?: (fromIndex: number, toIndex: number) => void;
  isHost?: boolean;
  isDJ?: boolean;
  onRequestSong?: (song: Song) => void;
  onRemoveSong?: (id: string) => void;
  onPlaySong?: (id: string) => void;
  currentUserId?: string;
  requests?: Song[];
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
}

export function QueueTab({
  queue = [],
  requests = [],
  onReorderQueue,
  isHost = false,
  isDJ = false,
  onRequestSong,
  onApproveRequest,
  onRejectRequest,
  onRemoveSong,
  onPlaySong,
  currentUserId,
}: QueueTabProps) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!isDJ) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isDJ || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isDJ || draggedIndex === null || draggedIndex === dropIndex) {
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
      
       {/* Pending Requests Section (Host/DJ only) */}
       {(isHost || isDJ) && requests.length > 0 && (
         <div className="mb-6 animate-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Pending Requests</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">{requests.length}</span>
            </h4>
            <div className="space-y-2">
                {requests.map((request) => (
                    <div key={request.id} className="bg-muted/40 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                            {request.thumbnail ? (
                                <img src={request.thumbnail} alt={request.title} className="h-full w-full object-cover opacity-80" /> 
                            ) : <div className="h-3 w-3 rounded-full bg-primary/20" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{request.title}</p>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                {request.artist} • <span className="opacity-70">req by {request.requestedBy}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => onApproveRequest?.(request.videoId)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-green-500/10 text-muted-foreground hover:text-green-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                            <button 
                                onClick={() => onRejectRequest?.(request.videoId)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-px bg-border/50 my-6" />
         </div>
       )}

      {/* Queue list */}
      <h3 className="text-xl font-bold text-foreground mb-4">Up Next</h3>
      <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
        {queue.length > 0 ? (
          queue.map((song, index) => (
            <div
              key={song.id}
              draggable={isDJ}
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
              {isDJ && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <QueueSongItem
                id={song.id || song.videoId} // Fallback to videoId if id is missing (e.g. from search)
                title={song.title}
                artist={song.artist}
                duration={song.duration.toString()}
                thumbnail={song.thumbnail}
                requestedBy={song.requestedBy || "Unknown"}
                isDJ={isDJ}
                isOwn={currentUserId !== undefined && (song.requestedById === currentUserId || song.requestedBy === currentUserId)}
                onRemove={() => song.videoId && onRemoveSong?.(song.videoId)}
                onPlay={() => song.videoId && onPlaySong?.(song.videoId)}
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

       {/* Request song button logic (if queue is empty or generic FAB) */}
       {/* Removed modal logic here as we have search overlay globally */}
    </div>
  );
}
