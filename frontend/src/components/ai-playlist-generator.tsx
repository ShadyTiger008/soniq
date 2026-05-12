"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Music, Play, Plus, Check, Volume2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoodPlaylistModal } from "./mood-playlist-modal";
import { GlassCard } from "./glass-card";
import { apiClient } from "@frontend/lib/api-client";
import { API_ENDPOINTS } from "@frontend/config/api.config";
import { toast } from "sonner";
import { useRoomPlayer } from "@frontend/hooks/use-room-player";
import { useParams } from "next/navigation";
import { useAuth } from "@frontend/lib/auth-context";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@frontend/components/ui/dialog";
import { ScrollArea } from "@frontend/components/ui/scroll-area";
import { Button } from "@frontend/components/ui/button";

interface Track {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail?: string;
}

interface GeneratedPlaylist {
  _id: string;
  title: string;
  description: string;
  mood: string;
  tracks: Track[];
}

export function AIPlaylistGenerator() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlist, setPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [generatingStatus, setGeneratingStatus] = useState("Analyzing your vibe...");
  
  const params = useParams();
  const { user } = useAuth();
  const roomId = params.id as string;
  const { addToQueue } = useRoomPlayer(roomId || "explore", user?._id || user?.id, false);

  // Helper to clean YouTube titles
  const cleanTitle = (title: string) => {
    return title
      .replace(/\[.*?\]/g, "") // Remove [Official Video] etc
      .replace(/\(.*?\)/g, "") // Remove (Lyrics) etc
      .replace(/\|.*/g, "")    // Remove everything after |
      .replace(/Official Video/gi, "")
      .replace(/Official Audio/gi, "")
      .replace(/Lyrics/gi, "")
      .trim();
  };

  // Dynamic color mapping based on mood
  const getMoodColors = (mood: string) => {
    const m = mood.toLowerCase();
    if (m.includes("chill") || m.includes("relax")) return "from-blue-600 to-indigo-600";
    if (m.includes("party") || m.includes("dance")) return "from-yellow-400 to-orange-500";
    if (m.includes("romantic") || m.includes("love")) return "from-pink-500 to-rose-600";
    if (m.includes("study") || m.includes("focus")) return "from-emerald-500 to-teal-600";
    if (m.includes("sad") || m.includes("moody")) return "from-slate-700 to-slate-900";
    return "from-primary to-electric-magenta";
  };

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    setPlaylist(null);
    
    const statuses = [
      "Analyzing your vibe...",
      "Consulting Vibecue Buddy...",
      "Searching for hidden gems...",
      "Matching tempo and energy...",
      "Polishing the mix...",
    ];
    
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      setGeneratingStatus(statuses[statusIndex] ?? "Analysing...");
    }, 2000);

    try {
      const response = await apiClient.post(API_ENDPOINTS.PLAYLIST.GENERATE, data);
      if (response.success && response.data) {
        setPlaylist(response.data as GeneratedPlaylist);
        toast.success("AI Playlist generated successfully!");
      } else {
        toast.error(response.error || "Failed to generate playlist");
      }
    } catch (error) {
      toast.error("An error occurred during generation");
    } finally {
      clearInterval(statusInterval);
      setIsGenerating(false);
      setIsModalOpen(false);
    }
  };

  const handleAddToRoom = async () => {
    if (!playlist || !roomId) return;
    
    try {
      const tracksCount = playlist.tracks.length;
      toast.info(`Adding ${tracksCount} tracks to queue...`, { duration: 2000 });
      
      // Batch add to queue for better performance
      for (const track of playlist.tracks) {
        await addToQueue({
          ...track,
          title: cleanTitle(track.title)
        });
      }
      
      toast.success(`Successfully added your playlist!`, {
        description: `${playlist.title} is now in the queue.`
      });
      setPlaylist(null);
    } catch (error) {
      toast.error("Failed to add songs to queue");
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="group relative flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl px-5 py-2.5 transition-all shadow-xl hover:shadow-primary/10"
      >
        <div className="bg-gradient-to-br from-primary to-electric-magenta p-2 rounded-lg shadow-lg shadow-primary/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-black text-white tracking-tight group-hover:text-primary transition-colors uppercase italic font-space-grotesk">Ask Vibecue Buddy</div>
          <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">AI Playlist Genius</div>
        </div>
        
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none" />
      </motion.button>

      <MoodPlaylistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGenerate={handleGenerate} 
      />

      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-3xl"
          >
            <div className="relative flex flex-col items-center max-w-md w-full px-6">
              {/* Cinematic Glow Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-primary/20 blur-[120px] rounded-full scale-150 animate-pulse" />
              
              <div className="relative mb-12">
                <motion.div 
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="relative z-10 p-8 rounded-full bg-white/[0.02] border border-white/5"
                >
                  <Loader2 className="h-32 w-32 text-primary stroke-[1px]" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <Sparkles className="h-12 w-12 text-white shadow-2xl" />
                </motion.div>
              </div>
              
              <div className="text-center relative z-10 space-y-4">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={generatingStatus}
                    initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
                    className="text-4xl font-black text-white tracking-tighter leading-none"
                  >
                    {generatingStatus}
                  </motion.h2>
                </AnimatePresence>
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-white/10" />
                  <p className="text-primary/80 text-[10px] font-black uppercase tracking-[0.4em]">
                    Vibecue Multi-Sync Engine
                  </p>
                  <span className="h-px w-8 bg-white/10" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Dialog open={!!playlist} onOpenChange={() => setPlaylist(null)}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#0A0A0B] border-white/10 rounded-[2.5rem] h-[85vh] flex flex-col">
            <DialogHeader className="sr-only">
              <DialogTitle>{playlist?.title}</DialogTitle>
              <DialogDescription>{playlist?.description}</DialogDescription>
            </DialogHeader>

            {playlist && (
              <>
                {/* Dynamic Mood Background Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-b ${getMoodColors(playlist.mood)} opacity-20 blur-[80px] -translate-y-32 pointer-events-none`} />

                {/* Header Section */}
                <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-8 bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/5">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`h-32 w-32 sm:h-40 sm:w-40 rounded-[2rem] bg-gradient-to-br ${getMoodColors(playlist.mood)} flex items-center justify-center shadow-2xl relative overflow-hidden group`}
                  >
                    <Music className="h-12 w-12 text-white/90 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white/40 animate-pulse" />
                  </motion.div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                      <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        {playlist.mood}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        {playlist.tracks.length} Anthems
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2 leading-none font-space-grotesk">{playlist.title}</h2>
                    <p className="text-base text-white/40 font-medium line-clamp-2 max-w-2xl">{playlist.description}</p>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 shrink-0">
                    <Button 
                      variant="ghost"
                      onClick={() => setPlaylist(null)}
                      className="px-8 py-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-black text-xs uppercase tracking-widest transition-all border border-white/5 h-auto"
                    >
                      Discard
                    </Button>
                    {roomId && (
                      <Button 
                        onClick={handleAddToRoom}
                        className="flex items-center justify-center gap-3 px-10 py-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] transition-all h-auto"
                      >
                        <Plus className="h-5 w-5" /> Add All to Queue
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tracks List with ScrollArea */}
                <ScrollArea className="flex-1 px-4 sm:px-10 bg-black/20">
                  <div className="py-6 space-y-2">
                    {playlist.tracks.map((track, index) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.03 }}
                        key={track.videoId}
                        className="group flex items-center gap-6 p-4 hover:bg-white/[0.04] rounded-[1.5rem] transition-all border border-transparent hover:border-white/5"
                      >
                        <div className="text-xs font-black text-white/10 w-6 text-center font-mono">{String(index + 1).padStart(2, '0')}</div>
                        
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                          <img src={track.thumbnail} alt={track.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-5 w-5 text-white fill-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white text-base truncate group-hover:text-primary transition-colors duration-300 font-space-grotesk">
                            {cleanTitle(track.title)}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-white/30 font-bold truncate">{track.artist}</p>
                            {index < 3 && (
                              <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Hot Match</span>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:block text-xs font-black text-white/20 tabular-nums tracking-widest font-mono">
                          {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                        </div>

                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToQueue({ ...track, title: cleanTitle(track.title) })}
                          className="p-3 rounded-xl bg-white/5 hover:bg-primary text-white/20 hover:text-white transition-all"
                        >
                          <Plus className="h-5 w-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Footer */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">AI Engine Active • High Fidelity Selection</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-20">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-[9px] font-black uppercase">Powered by Vibecue AI</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </>
  );
}
