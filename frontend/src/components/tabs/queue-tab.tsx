"use client";

import { useState } from "react";
import { GripVertical, Music, ListMusic, CheckCircle2, XCircle, Flame } from "lucide-react";
import { QueueSongItem } from "../queue-song-item";
import { motion, AnimatePresence } from "framer-motion";
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
  onApproveRequest,
  onRejectRequest,
  onRemoveSong,
  onPlaySong,
  currentUserId,
}: QueueTabProps) {
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
    <div className="flex h-full flex-col p-6 bg-surface-low/30 overflow-y-auto scrollbar-hide">
      
       {/* Pending Requests Section - Premium Cinematic Style */}
       {(isHost || isDJ) && requests.length > 0 && (
         <div className="mb-10 animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-black text-white tracking-widest uppercase">The Queue Waitlist</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">High Energy Requests Detected</span>
                </div>
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black border border-primary/20">
                    {requests.length} Requests
                </div>
            </div>

            <div className="space-y-3">
                {requests.map((request, idx) => (
                    <motion.div 
                        key={request.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-surface-high/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-xl"
                    >
                        <div className="h-12 w-12 bg-surface-highest rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/5 shadow-inner">
                            {request.thumbnail ? (
                                <img src={request.thumbnail} alt={request.title} className="h-full w-full object-cover opacity-80" /> 
                            ) : <Music className="h-5 w-5 text-primary/40" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-sm truncate tracking-tight">{request.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-widest mt-1">
                                {request.artist} • <span className="text-primary italic">req by @{request.requestedBy}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => onApproveRequest?.(request.videoId)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                                title="Approve Vibe"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => onRejectRequest?.(request.videoId)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                title="Reject"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="mt-8 mb-8 border-t border-dashed border-white/5" />
         </div>
       )}

      {/* Main Queue List Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-white tracking-widest uppercase italic">The Pulse Lineup</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Synchronized and Live</span>
        </div>
        <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <ListMusic className="h-5 w-5 text-white/40" />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {queue.length > 0 ? (
          queue.map((song, index) => (
            <div
              key={song.id}
              draggable={isDJ}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "smooth-transition relative",
                draggedIndex === index && "opacity-30 scale-95",
                dragOverIndex === index && "translate-x-2 border-l-2 border-primary"
              )}
            >
              <QueueSongItem
                id={song.id || song.videoId}
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
          <div className="flex flex-col h-64 items-center justify-center text-center opacity-40">
            <Flame className="h-12 w-12 text-primary/40 mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white">The Atmosphere is Silent</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Add a track to spark the fire</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
