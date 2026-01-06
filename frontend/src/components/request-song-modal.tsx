"use client";

import { useState, useEffect } from "react";
import { Search, X, Clock, Music } from "lucide-react";
import { apiClient } from "@frontend/lib/api-client";
import type { Song } from "@frontend/types";

interface RequestSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (song: Song) => void;
}

export function RequestSongModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestSongModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const searchSongs = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.searchYouTube(searchQuery);
        if (response.success && response.data) {
          setResults(response.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchSongs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleRequestSong = (song: Song) => {
    if (onSubmit) {
      onSubmit(song);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-card relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl sm:w-full sm:rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-heading font-700 text-foreground text-xl">
            Request a Song
          </h2>
          <button
            onClick={onClose}
            className="smooth-transition rounded-lg p-2 hover:bg-muted"
          >
            <X className="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by song title or artist..."
              autoFocus
              className="text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary smooth-transition w-full rounded-lg border border-border bg-muted/30 py-3 pr-4 pl-10 focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4 min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : results.length > 0 ? (
            results.map((song) => (
              <button
                key={song.id}
                onClick={() => handleRequestSong(song)}
                className="bg-card hover:bg-muted border border-border hover:border-primary/50 smooth-transition group w-full rounded-lg p-3 text-left"
              >
                <div className="flex items-center gap-3">
                   {song.thumbnail ? (
                      <img src={song.thumbnail} alt={song.title} className="h-10 w-10 rounded object-cover bg-black/50" />
                   ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                   )}
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-foreground group-hover:text-primary smooth-transition truncate">
                      {song.title}
                    </p>
                    <p className="text-muted-foreground text-sm truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      {song.duration}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : searchQuery ? (
             <div className="text-center text-muted-foreground py-8">
                No songs found for "{searchQuery}"
             </div>
          ) : (
             <div className="text-center text-muted-foreground py-8">
                Start typing to search for songs
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-muted-foreground border-t border-border p-4 text-center text-sm bg-muted/20">
           All searches provided by YouTube
        </div>
      </div>
    </div>
  );
}
